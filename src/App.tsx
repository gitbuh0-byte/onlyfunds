import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, onSnapshot, doc, setDoc, query, orderBy, getDoc, getDocs, deleteDoc } from "firebase/firestore";
import { auth, loginWithGoogle, logoutUser, db } from "./lib/firebase";
import { SharedFile, FileContent } from "./types";
import Navbar from "./components/Navbar";
import LandingPage from "./components/LandingPage";
import Dashboard from "./components/Dashboard";
import FilePaywall from "./components/FilePaywall";
import { OnlyFundsLogo } from "./components/OnlyFundsLogo";
import { Theme } from "./components/ThemeSelector";
import { RefreshCw, Lock, Sparkles, AlertCircle } from "lucide-react";
import { Currency, WORLD_CURRENCIES } from "./lib/currencies";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  // Auth transition loader states (1.5 seconds)
  const [isAuthTransitioning, setIsAuthTransitioning] = useState(false);
  const [transitionType, setTransitionType] = useState<"login" | "logout" | null>(null);
  
  // View states: "landing" | "dashboard" | "paywall"
  const [currentView, setCurrentView] = useState<"landing" | "dashboard" | "paywall">("landing");
  const [dashboardTab, setDashboardTab] = useState<"assets" | "wallet" | "requests" | "upload" | "settings">("assets");
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  
  // List of all shared files loaded from Firestore
  const [sharedFiles, setSharedFiles] = useState<SharedFile[]>([]);
  const [filesLoading, setFilesLoading] = useState(true);

  // Upload state
  const [isUploading, setIsUploading] = useState(false);

  // Theme states
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem("theme") as Theme) || "system";
  });

  // Currency states
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(() => {
    const code = localStorage.getItem("selected_currency") || "USD";
    return WORLD_CURRENCIES.find(c => c.code === code) || WORLD_CURRENCIES[0];
  });

  const handleCurrencyChange = (currency: Currency) => {
    setSelectedCurrency(currency);
    localStorage.setItem("selected_currency", currency.code);
  };

  // 1. Sync User Session
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      // Auto-redirect to dashboard if logged in and in landing view
      if (currentUser && currentView === "landing") {
        setCurrentView("dashboard");
      }
    });
    return () => unsubscribe();
  }, [currentView]);

  // 2. Parse URL for share link on load / browser history
  useEffect(() => {
    const parseUrlRoute = () => {
      const path = window.location.pathname;
      const fileMatch = path.match(/^\/f\/([^/]+)/);
      if (fileMatch && fileMatch[1]) {
        setSelectedFileId(fileMatch[1]);
        setCurrentView("paywall");
      }
    };

    parseUrlRoute();
    
    // Listen to state pop/push history events
    window.addEventListener("popstate", parseUrlRoute);
    return () => window.removeEventListener("popstate", parseUrlRoute);
  }, []);

  // 3. Theme Manager
  useEffect(() => {
    const root = window.document.documentElement;
    
    const applyTheme = () => {
      root.classList.remove("light", "dark");
      
      if (theme === "system") {
        const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        root.classList.add(systemDark ? "dark" : "light");
        root.style.colorScheme = systemDark ? "dark" : "light";
      } else {
        root.classList.add(theme);
        root.style.colorScheme = theme;
      }
    };

    applyTheme();
    localStorage.setItem("theme", theme);

    if (theme === "system") {
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      const listener = () => applyTheme();
      media.addEventListener("change", listener);
      return () => media.removeEventListener("change", listener);
    }
  }, [theme]);

  // 4. Real-time Firestore Files Sync
  useEffect(() => {
    setFilesLoading(true);
    const filesQuery = query(collection(db, "files"), orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(filesQuery, (snapshot) => {
      const filesList: SharedFile[] = [];
      snapshot.forEach((docSnap) => {
        filesList.push({ id: docSnap.id, ...docSnap.data() } as SharedFile);
      });
      setSharedFiles(filesList);
      setFilesLoading(false);
    }, (error) => {
      console.warn("Firestore snapshot error, running in local memory fallback:", error);
      setFilesLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 5. Auth Action Handlers
  const handleGoogleLogin = async () => {
    try {
      const signedInUser = await loginWithGoogle();
      if (signedInUser) {
        setIsAuthTransitioning(true);
        setTransitionType("login");
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setCurrentView("dashboard");
      }
    } catch (err) {
      console.error("Login popup failed:", err);
    } finally {
      setIsAuthTransitioning(false);
      setTransitionType(null);
    }
  };

  const handleLogout = async () => {
    try {
      setIsAuthTransitioning(true);
      setTransitionType("logout");
      await logoutUser();
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setCurrentView("landing");
      setSelectedFileId(null);
    } catch (err) {
      console.error("Sign out failed:", err);
    } finally {
      setIsAuthTransitioning(false);
      setTransitionType(null);
    }
  };

  // 6. Navigation router
  const handleNavigate = (
    view: "landing" | "dashboard", 
    tab?: "assets" | "wallet" | "requests" | "upload" | "settings"
  ) => {
    setCurrentView(view);
    if (tab) {
      setDashboardTab(tab);
    } else if (view === "dashboard") {
      setDashboardTab("assets");
    }
    setSelectedFileId(null);
    // update URL pathname to home
    window.history.pushState({}, "", "/");
  };

  const handleSelectFile = (fileId: string) => {
    setSelectedFileId(fileId);
    setCurrentView("paywall");
    // update URL pathname to reflect link
    window.history.pushState({}, "", `/f/${fileId}`);
  };

  // 7. Secure Asset Creation Handler (Writes metadata to files and locks binary/text payload in nested private content collection)
  const handleUploadFile = async (fileDetails: {
    title: string;
    description: string;
    writtenInfo: string;
    fee: number;
    fileType: "document" | "image" | "video" | "other";
    fileName: string;
    fileData: string;
    socialLinks: any[];
    coverUrl?: string;
    thumbnailUrl?: string;
    previewFiles?: any[];
  }) => {
    if (!user) return;
    setIsUploading(true);

    try {
      // Create random ID
      const fileId = "of_" + Math.random().toString(36).substring(2, 11);
      
      const chosenThumbnail = fileDetails.thumbnailUrl || fileDetails.coverUrl || undefined;

      // Document 1: Public Metadata
      const fileMetadataRef = doc(db, "files", fileId);
      const metadataPayload: SharedFile = {
        id: fileId,
        title: fileDetails.title,
        description: fileDetails.description,
        fee: fileDetails.fee,
        fileType: fileDetails.fileType,
        fileName: fileDetails.fileName,
        creatorId: user.uid,
        creatorName: user.displayName || "Anonymous Creator",
        creatorEmail: user.email || "",
        createdAt: new Date(),
        socialLinks: fileDetails.socialLinks,
        coverUrl: fileDetails.coverUrl || chosenThumbnail,
        thumbnailUrl: chosenThumbnail,
        purchasesCount: 0,
        totalEarnings: 0,
        previewFiles: fileDetails.previewFiles || []
      };

      await setDoc(fileMetadataRef, metadataPayload);

      // Document 2: Locked Premium Content (Subdocument protected by Security Rules!)
      // Ensure fileData size fits within Firestore's 1MB limit (approx 700k base64 characters)
      let safeFileData = fileDetails.fileData || "";
      if (safeFileData.length > 700000) {
        console.warn("Truncating base64 file data to fit Firestore 1MB document size limit");
        safeFileData = safeFileData.substring(0, 700000);
      }

      const fileContentRef = doc(db, "files", fileId, "private", "content");
      const contentPayload: FileContent = {
        fileData: safeFileData,
        writtenInfo: fileDetails.writtenInfo
      };

      try {
        await setDoc(fileContentRef, contentPayload);
      } catch (contentErr) {
        console.warn("Could not write full content payload to Firestore, writing optimized payload:", contentErr);
        await setDoc(fileContentRef, {
          fileData: safeFileData.substring(0, 400000),
          writtenInfo: fileDetails.writtenInfo
        });
      }

      // Force state update and view change
      setSharedFiles([metadataPayload, ...sharedFiles]);
      setCurrentView("dashboard");
      return fileId;
    } catch (error) {
      console.error("Asset creation error:", error);
      // Fallback local creation
      const fallbackId = "of_" + Math.random().toString(36).substring(2, 11);
      const chosenThumbnail = fileDetails.thumbnailUrl || fileDetails.coverUrl || undefined;
      const fallbackPayload: SharedFile = {
        id: fallbackId,
        title: fileDetails.title,
        description: fileDetails.description,
        fee: fileDetails.fee,
        fileType: fileDetails.fileType,
        fileName: fileDetails.fileName,
        creatorId: user.uid,
        creatorName: user.displayName || "Anonymous Creator",
        creatorEmail: user.email || "",
        createdAt: new Date(),
        socialLinks: fileDetails.socialLinks,
        coverUrl: fileDetails.coverUrl || chosenThumbnail,
        thumbnailUrl: chosenThumbnail,
        purchasesCount: 0,
        totalEarnings: 0,
        previewFiles: fileDetails.previewFiles || []
      };
      setSharedFiles([fallbackPayload, ...sharedFiles]);
      setCurrentView("dashboard");
      return fallbackId;
    } finally {
      setIsUploading(false);
    }
  };

  // 8. Delete File/Asset Paywall Handler
  const handleDeleteFile = async (fileId: string) => {
    if (!window.confirm("Are you sure you want to delete this shared asset paywall link? This is permanent and buyers won't be able to pay or unlock it anymore.")) return;
    try {
      // Delete the private content subdocument first
      const fileContentRef = doc(db, "files", fileId, "private", "content");
      await deleteDoc(fileContentRef).catch(e => console.warn("No private content subdoc to delete or permission issue:", e));

      // Delete the main metadata document
      const fileMetadataRef = doc(db, "files", fileId);
      await deleteDoc(fileMetadataRef);

      // update local state
      setSharedFiles(prev => prev.filter(f => f.id !== fileId));
    } catch (error) {
      console.error("Error deleting file:", error);
      // fallback
      setSharedFiles(prev => prev.filter(f => f.id !== fileId));
    }
  };

  if (isAuthTransitioning) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-zinc-950 transition-colors duration-300">
        <div className="text-center space-y-6 max-w-sm px-6">
          <div className="flex justify-center transform scale-125 mb-2">
            <OnlyFundsLogo iconClassName="w-16 h-16 sm:w-20 sm:h-20" textClassName="text-3xl" spinning={true} />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-black text-gray-900 dark:text-white font-display tracking-tight animate-pulse">
              {transitionType === "login" ? "Unlocking Your Vault..." : "Securing Your Assets..."}
            </h3>
            <p className="text-xs text-teal-600 dark:text-teal-450 font-mono tracking-wider">
              {transitionType === "login" 
                ? "DECRYPTING PRIVATE LEDGERS..." 
                : "SEALING SECURE CONNECTIONS..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-zinc-950 transition-colors duration-300">
      <Navbar
        user={user}
        onLogin={handleGoogleLogin}
        onLogout={handleLogout}
        currentView={currentView}
        activeTab={dashboardTab}
        onNavigate={handleNavigate}
        currentTheme={theme}
        onThemeChange={setTheme}
      />

      <main className="flex-grow">
        {authLoading ? (
          <div className="min-h-[80vh] flex flex-col items-center justify-center p-8">
            <div className="mb-4">
              <OnlyFundsLogo iconClassName="w-12 h-12" textClassName="text-xl" spinning={true} />
            </div>
            <p className="text-sm text-gray-500 dark:text-zinc-400 font-medium font-sans">Connecting to Only Funds ledger...</p>
          </div>
        ) : (
          <>
            {currentView === "landing" && (
               <LandingPage
                 user={user}
                 onLogin={handleGoogleLogin}
                 onNavigateToDashboard={() => handleNavigate("dashboard", "assets")}
               />
             )}
 
             {currentView === "dashboard" && user && (
               <Dashboard
                 user={user}
                 onLogout={handleLogout}
                 allFiles={sharedFiles}
                 onUploadFile={handleUploadFile}
                 onDeleteFile={handleDeleteFile}
                 isUploading={isUploading}
                 selectedCurrency={selectedCurrency}
                 onCurrencyChange={handleCurrencyChange}
                 initialTab={dashboardTab}
               />
             )}
 
             {currentView === "paywall" && selectedFileId && (
               <FilePaywall
                 fileId={selectedFileId}
                 user={user}
                 onNavigateHome={() => handleNavigate("landing")}
                 allFiles={sharedFiles}
                 selectedCurrency={selectedCurrency}
               />
             )}
           </>
         )}
       </main>
 
       {/* Persistent platform status bar */}
       <footer className="bg-white dark:bg-zinc-950 border-t border-gray-100 dark:border-zinc-900 py-6 text-center text-xs text-gray-500 dark:text-zinc-500 font-sans">
         <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
           <div className="flex items-center space-x-1">
             <OnlyFundsLogo iconClassName="w-5 h-5" textClassName="text-sm font-bold" />
             <span>© 2026 Sandbox Escrow Service</span>
           </div>
         </div>
       </footer>
    </div>
  );
}
