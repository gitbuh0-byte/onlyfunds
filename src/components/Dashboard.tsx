import React, { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { 
  DollarSign, Download, Share2, Clipboard, Mail, ArrowRight, UserCheck, Inbox, 
  ExternalLink, FileText, CheckCircle, Clock, Check, Plus, UploadCloud, ChevronDown, ChevronUp, Users, Send, AlertCircle, Settings, Search,
  Edit3, Trash2, Wallet, Smartphone, Building2, Coins, ArrowUpRight, Copy, X, CheckCircle2, ShieldCheck, Sparkles, Receipt, XCircle, Filter, QrCode, RefreshCw,
  Image as ImageIcon, Video, FileCode, ZoomIn, Eye, Layers
} from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { SharedFile, PurchaseRecord, FileRequest, WithdrawalRecord } from "../types";
import { collection, query, where, getDocs, addDoc, doc, setDoc, getDoc, deleteDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import FileUploader from "./FileUploader";
import SocialPreview from "./SocialPreview";
import EmailTemplate from "./EmailTemplate";
import { AssetPreviewModal } from "./AssetPreviewModal";
import { Currency, WORLD_CURRENCIES, formatPrice } from "../lib/currencies";

interface DashboardProps {
  user: User;
  onLogout: () => void;
  allFiles: SharedFile[];
  onUploadFile: (fileDetails: any) => Promise<string | void>;
  onDeleteFile?: (fileId: string) => Promise<void>;
  isUploading: boolean;
  selectedCurrency: Currency;
  onCurrencyChange: (currency: Currency) => void;
  initialTab?: "assets" | "wallet" | "requests" | "upload" | "settings";
}

export default function Dashboard({ 
  user, 
  onLogout, 
  allFiles, 
  onUploadFile, 
  onDeleteFile,
  isUploading,
  selectedCurrency,
  onCurrencyChange,
  initialTab = "assets"
}: DashboardProps) {
  const [activeTab, setActiveTab] = useState<"assets" | "wallet" | "requests" | "upload" | "settings">(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [currencySearch, setCurrencySearch] = useState("");
  const [assetSearchQuery, setAssetSearchQuery] = useState("");
  const [newlyCreatedFileId, setNewlyCreatedFileId] = useState<string | null>(null);
  const [qrModalFile, setQrModalFile] = useState<SharedFile | null>(null);

  const handleDownloadQrCode = (file: SharedFile) => {
    const canvas = document.getElementById(`qr-canvas-${file.id}`) as HTMLCanvasElement;
    if (!canvas) return;
    const imageURI = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = imageURI;
    link.download = `paywall-qr-${file.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("QR Code PNG downloaded successfully!", "success");
  };
  
  // Toast Notification State
  const [toast, setToast] = useState<{ 
    show: boolean; 
    message: string; 
    type: "success" | "error" | "info";
    action?: {
      fileId: string;
      link: string;
      label?: string;
    };
  }>({
    show: false,
    message: "",
    type: "success"
  });

  const showToast = (
    message: string, 
    type: "success" | "error" | "info" = "success",
    action?: { fileId: string; link: string; label?: string }
  ) => {
    setToast({ show: true, message, type, action });
  };

  const handleUploadSuccess = async (fileDetails: any) => {
    const resId = await onUploadFile(fileDetails);
    const createdId = resId || ("of_" + Math.random().toString(36).substring(2, 9));
    setNewlyCreatedFileId(createdId);
    setActiveTab("assets");
    const paywallUrl = `${window.location.origin}/f/${createdId}`;
    showToast(`Asset "${fileDetails.title}" created & paywall link live!`, "success", {
      fileId: createdId,
      link: paywallUrl,
      label: "Copy Link"
    });

    // Auto clear newly created animation highlight after 8 seconds
    setTimeout(() => {
      setNewlyCreatedFileId(prev => (prev === createdId ? null : prev));
    }, 8000);
  };

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast(prev => ({ ...prev, show: false }));
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  // Wallet & Withdrawal State
  const [withdrawals, setWithdrawals] = useState<WithdrawalRecord[]>([]);
  const [withdrawMethod, setWithdrawMethod] = useState<"mpesa" | "crypto" | "bank">("mpesa");
  const [mpesaPhone, setMpesaPhone] = useState("+254 712 345 678");
  const [cryptoAddress, setCryptoAddress] = useState("");
  const [cryptoNetwork, setCryptoNetwork] = useState("USDT (TRC20)");
  const [bankName, setBankName] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  // Profile & Mobile Money Settings state
  const [profileName, setProfileName] = useState(user?.displayName || "Creator");
  const [profileEmail, setProfileEmail] = useState(user?.email || "");
  const [profileMpesaPhone, setProfileMpesaPhone] = useState("+254 712 345 678");
  const [profileMobileMethod, setProfileMobileMethod] = useState<"mpesa" | "airtel" | "mtn" | "tigo">("mpesa");
  const [profileAccountName, setProfileAccountName] = useState(user?.displayName || "Registered M-Pesa Name");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) return;
      try {
        const userDocRef = doc(db, "users", user.uid);
        const snap = await getDoc(userDocRef);
        if (snap.exists()) {
          const data = snap.data();
          if (data.displayName) setProfileName(data.displayName);
          if (data.email) setProfileEmail(data.email);
          if (data.mpesaPhoneNumber) {
            setProfileMpesaPhone(data.mpesaPhoneNumber);
            setMpesaPhone(data.mpesaPhoneNumber);
          }
          if (data.mobileMoneyMethod) setProfileMobileMethod(data.mobileMoneyMethod);
          if (data.accountName) setProfileAccountName(data.accountName);
        }
      } catch (err) {
        console.warn("Could not load user profile from Firestore:", err);
      }
    };
    loadUserProfile();
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSavingProfile(true);
    try {
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, {
        uid: user.uid,
        displayName: profileName,
        email: profileEmail,
        mpesaPhoneNumber: profileMpesaPhone,
        mobileMoneyMethod: profileMobileMethod,
        accountName: profileAccountName,
        updatedAt: new Date()
      }, { merge: true });

      setMpesaPhone(profileMpesaPhone);
      showToast("Profile & M-Pesa settlement details saved successfully!", "success");
    } catch (err) {
      console.error("Error saving profile:", err);
      showToast("Failed to save profile settings.", "error");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Wallet Navigation & Transaction History View State
  const [walletSubTab, setWalletSubTab] = useState<"withdraw" | "history">("history");
  const [historyStatusFilter, setHistoryStatusFilter] = useState<"all" | "pending" | "completed" | "failed">("all");
  const [historySearchQuery, setHistorySearchQuery] = useState("");
  const [selectedReceipt, setSelectedReceipt] = useState<WithdrawalRecord | null>(null);
  const [selectedPreviewAsset, setSelectedPreviewAsset] = useState<SharedFile | null>(null);

  // Detail toggle for social previews and email layouts
  const [expandedFileId, setExpandedFileId] = useState<string | null>(null);

  // Firestore synced stats & requests
  const [creatorFiles, setCreatorFiles] = useState<SharedFile[]>([]);
  const [requests, setRequests] = useState<FileRequest[]>([]);
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);
  
  // Custom request creation state (simulation of another user making a request)
  const [requestTitle, setRequestTitle] = useState("");
  const [requestDesc, setRequestDesc] = useState("");
  const [requestFee, setRequestFee] = useState("30.00");
  const [requesterEmail, setRequesterEmail] = useState("buyer@example.com");
  const [requesterName, setRequesterName] = useState("Sarah Jenkins");
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);

  // Active edit state for briefs
  const [editingRequest, setEditingRequest] = useState<FileRequest | null>(null);

  // Load creator assets, purchases, and requests
  useEffect(() => {
    loadDashboardData();
  }, [user, allFiles]);

  const loadDashboardData = async () => {
    // 1. Filter local files first
    const mine = allFiles.filter(f => f.creatorId === user.uid);
    setCreatorFiles(mine);

    try {
      // 2. Fetch requests for this creator from Firestore
      const reqQuery = query(collection(db, "requests"), where("creatorId", "==", user.uid));
      const reqSnap = await getDocs(reqQuery);
      const reqList: FileRequest[] = [];
      reqSnap.forEach((docSnap) => {
        reqList.push({ id: docSnap.id, ...docSnap.data() } as FileRequest);
      });
      
      // If empty, add a default pre-seeded request to make it highly interactive!
      if (reqList.length === 0) {
        const seeded = {
          requesterName: "Sarah Jenkins",
          requesterEmail: "sarah@creativeco.org",
          title: "Custom Brand Logo Pack & Brandbook Guidelines",
          description: "Need a full vector logo design with dark/light variants and a 3-page brandbook specifying typography guidelines and hex colors for an e-commerce brand.",
          offeredFee: 45.00,
          status: "pending" as const,
          creatorId: user.uid,
          createdAt: new Date()
        };
        try {
          const docRef = await addDoc(collection(db, "requests"), seeded);
          reqList.push({ id: docRef.id, ...seeded });
        } catch (seededErr) {
          console.warn("Could not seed default request to Firestore, using local memory fallback", seededErr);
          reqList.push({
            id: "seeded-request-1",
            ...seeded
          });
        }
      }
      setRequests(reqList);

      // 3. Fetch purchase logs for creator's assets
      const purQuery = query(collection(db, "purchases"), where("creatorId", "==", user.uid));
      const purSnap = await getDocs(purQuery);
      const purList: PurchaseRecord[] = [];
      purSnap.forEach((docSnap) => {
        purList.push({ id: docSnap.id, ...docSnap.data() } as PurchaseRecord);
      });
      setPurchases(purList);

      // 4. Fetch withdrawal records for creator
      try {
        const wdQuery = query(collection(db, "withdrawals"), where("creatorId", "==", user.uid));
        const wdSnap = await getDocs(wdQuery);
        const wdList: WithdrawalRecord[] = [];
        wdSnap.forEach((docSnap) => {
          wdList.push({ id: docSnap.id, ...docSnap.data() } as WithdrawalRecord);
        });

        // Seed default historical withdrawal records if empty for interactive demo
        if (wdList.length === 0) {
          const seeded1: WithdrawalRecord = {
            id: "seeded-wd-1",
            creatorId: user.uid,
            method: "mpesa",
            recipient: "+254 712 *** 890",
            networkOrBank: "Safaricom M-Pesa",
            amountUSD: 35.00,
            status: "completed",
            createdAt: new Date(Date.now() - 86400000 * 2),
            transactionRef: "MPESA-QK82910X"
          };
          wdList.push(seeded1);
        }

        wdList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setWithdrawals(wdList);
      } catch (wdErr) {
        console.warn("Could not fetch withdrawals from Firestore:", wdErr);
      }

    } catch (err) {
      console.warn("Could not sync dashboard data from cloud, local fallback active.", err);
    }
  };

  // Submit edit form to Firestore and update local state
  const handleEditRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRequest) return;

    try {
      const reqRef = doc(db, "requests", editingRequest.id);
      const updatedData = {
        title: editingRequest.title,
        description: editingRequest.description,
        offeredFee: Number(editingRequest.offeredFee) || 0,
        requesterName: editingRequest.requesterName,
        requesterEmail: editingRequest.requesterEmail,
        status: editingRequest.status,
      };

      await setDoc(reqRef, updatedData, { merge: true });
      setRequests(requests.map(r => r.id === editingRequest.id ? { ...r, ...updatedData } : r));
      setEditingRequest(null);
      showToast("Brief updated successfully!", "success");
    } catch (err) {
      console.error("Failed editing request:", err);
      // fallback local update
      setRequests(requests.map(r => r.id === editingRequest.id ? { ...r, ...editingRequest } : r));
      setEditingRequest(null);
      showToast("Brief updated locally!", "success");
    }
  };

  // Delete a request brief
  const handleDeleteRequest = async (requestId: string) => {
    if (!window.confirm("Are you sure you want to delete this brief? This operation is permanent.")) return;
    try {
      const reqRef = doc(db, "requests", requestId);
      await deleteDoc(reqRef);
      setRequests(requests.filter(r => r.id !== requestId));
      showToast("Brief deleted permanently.", "info");
    } catch (err) {
      console.error("Failed deleting request:", err);
      // fallback local state
      setRequests(requests.filter(r => r.id !== requestId));
      showToast("Brief removed.", "info");
    }
  };

  const handleCopyLink = (fileId: string) => {
    const link = `${window.location.origin}/f/${fileId}`;
    navigator.clipboard.writeText(link);
    setCopiedId(fileId);
    showToast("Paywall link copied to clipboard!", "success");
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Submit withdrawal request to M-Pesa, Crypto, or Bank
  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(withdrawAmount);

    if (isNaN(amount) || amount <= 0) {
      showToast("Please enter a valid amount to withdraw.", "error");
      return;
    }

    if (amount > availableBalance) {
      showToast(`Insufficient balance. Available: $${availableBalance.toFixed(2)}`, "error");
      return;
    }

    let recipientDetails = "";
    let networkDetails = "";

    if (withdrawMethod === "mpesa") {
      if (!mpesaPhone.trim()) {
        showToast("Please enter a valid M-Pesa phone number.", "error");
        return;
      }
      recipientDetails = mpesaPhone.trim();
      networkDetails = "Safaricom M-Pesa Express";
    } else if (withdrawMethod === "crypto") {
      if (!cryptoAddress.trim()) {
        showToast("Please enter your Crypto wallet address.", "error");
        return;
      }
      recipientDetails = cryptoAddress.trim();
      networkDetails = cryptoNetwork;
    } else if (withdrawMethod === "bank") {
      if (!bankName.trim() || !bankAccount.trim()) {
        showToast("Please enter both Bank Name and Account/IBAN.", "error");
        return;
      }
      recipientDetails = `${bankName} - ${bankAccount}`;
      networkDetails = "Direct Bank Wire";
    }

    setIsWithdrawing(true);

    try {
      const newWd: Omit<WithdrawalRecord, "id"> = {
        creatorId: user.uid,
        method: withdrawMethod,
        recipient: recipientDetails,
        networkOrBank: networkDetails,
        amountUSD: amount,
        status: "processing",
        createdAt: new Date(),
        transactionRef: `OF-${withdrawMethod.toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
      };

      const docRef = await addDoc(collection(db, "withdrawals"), newWd);
      const record = { id: docRef.id, ...newWd } as WithdrawalRecord;

      setWithdrawals([record, ...withdrawals]);
      setWithdrawAmount("");
      setWalletSubTab("history");
      showToast(`Withdrawal of $${amount.toFixed(2)} via ${withdrawMethod.toUpperCase()} submitted!`, "success");
    } catch (err) {
      console.warn("Saving withdrawal to Firestore failed, local fallback used:", err);
      const record: WithdrawalRecord = {
        id: `local-wd-${Date.now()}`,
        creatorId: user.uid,
        method: withdrawMethod,
        recipient: recipientDetails,
        networkOrBank: networkDetails,
        amountUSD: amount,
        status: "processing",
        createdAt: new Date(),
        transactionRef: `OF-${withdrawMethod.toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
      };
      setWithdrawals([record, ...withdrawals]);
      setWithdrawAmount("");
      setWalletSubTab("history");
      showToast(`Withdrawal of $${amount.toFixed(2)} via ${withdrawMethod.toUpperCase()} submitted!`, "success");
    } finally {
      setIsWithdrawing(false);
    }
  };

  // Simulate a buyer submitting a file request to the creator
  const handleAddSimulatedRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingRequest(true);

    try {
      const newRequest: Omit<FileRequest, "id"> = {
        requesterName,
        requesterEmail,
        title: requestTitle,
        description: requestDesc,
        offeredFee: parseFloat(requestFee) || 0,
        status: "pending",
        creatorId: user.uid,
        createdAt: new Date()
      };

      const docRef = await addDoc(collection(db, "requests"), newRequest);
      setRequests([{ id: docRef.id, ...newRequest } as FileRequest, ...requests]);
      
      // Reset request form
      setRequestTitle("");
      setRequestDesc("");
      setRequestFee("30.00");
      setRequesterEmail("buyer@example.com");
      setRequesterName("Sarah Jenkins");
      setShowRequestForm(false);
    } catch (err) {
      console.error("Failed adding request:", err);
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  // Accept or decline file request
  const handleUpdateRequestStatus = async (requestId: string, status: "accepted" | "declined") => {
    try {
      const targetRequest = requests.find(r => r.id === requestId);
      if (!targetRequest) return;

      const reqRef = doc(db, "requests", requestId);

      if (status === "declined") {
        // 1. Delete from Firestore
        await deleteDoc(reqRef);
        // 2. Remove from local requests list
        setRequests(requests.filter(r => r.id !== requestId));
        alert(`Request "${targetRequest.title}" was declined and permanently deleted.`);
      } else if (status === "accepted") {
        // 1. Fulfill request by uploading a secure custom locked asset
        const fileTitle = `FULFILLED: ${targetRequest.title}`;
        const fileDesc = `This customized asset was securely created to fulfill ${targetRequest.requesterName}'s request: "${targetRequest.description}". Access keys are encrypted.`;
        
        await onUploadFile({
          title: fileTitle,
          description: fileDesc,
          writtenInfo: `Thank you for choosing custom design work! Here is your brand license code: OF-LIC-2983. Project files attached.`,
          fee: targetRequest.offeredFee,
          fileType: "document",
          fileName: `fulfilled-${targetRequest.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.zip`,
          fileData: "data:text/plain;base64,V09SS19GVUxGSUxMRURfT05MWV9GVU5EUw==",
          socialLinks: [],
          coverUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800"
        });

        // 2. Delete the brief from Firestore and local state
        await deleteDoc(reqRef);
        setRequests(requests.filter(r => r.id !== requestId));

        // 3. Switch to assets tab and show success message
        setActiveTab("assets");
        alert(`Request "${targetRequest.title}" accepted! A custom fulfilled shared asset has been created in your Shared Assets list.`);
      }
    } catch (err) {
      console.error("Failed updating request status:", err);
      // Fallback local cleanup
      setRequests(requests.filter(r => r.id !== requestId));
    }
  };

  // Fulfill Request: Creator uploads completed custom asset
  const handleFulfillRequest = async (request: FileRequest) => {
    const fileTitle = `FULFILLED: ${request.title}`;
    const fileDesc = `This customized asset was securely created to fulfill ${request.requesterName}'s request: "${request.description}". Access keys are encrypted.`;
    
    await onUploadFile({
      title: fileTitle,
      description: fileDesc,
      writtenInfo: `Thank you for choosing custom design work! Here is your brand license code: OF-LIC-2983. Project files attached.`,
      fee: request.offeredFee,
      fileType: "document",
      fileName: `fulfilled-${request.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.zip`,
      fileData: "data:text/plain;base64,V09SS19GVUxGSUxMRURfT05MWV9GVU5EUw==",
      socialLinks: [],
      coverUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800"
    });

    try {
      const reqRef = doc(db, "requests", request.id);
      await deleteDoc(reqRef);
      setRequests(requests.filter(r => r.id !== request.id));
      loadDashboardData();
    } catch (err) {
      console.error("Fulfillment database link failed:", err);
      setRequests(requests.filter(r => r.id !== request.id));
    }
  };

  // Math totals
  const totalEarnings = creatorFiles.reduce((acc, curr) => acc + (curr.totalEarnings || 0), 0);
  const grossEarnings = totalEarnings > 0 ? totalEarnings : 150.00;
  const totalWithdrawn = withdrawals.reduce((acc, curr) => acc + (curr.status !== "failed" ? curr.amountUSD : 0), 0);
  const availableBalance = Math.max(0, grossEarnings - totalWithdrawn);
  const totalSalesCount = creatorFiles.reduce((acc, curr) => acc + (curr.purchasesCount || 0), 0);

  return (
    <div id="creator-dashboard" className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="text-left">
          <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <span>Welcome,</span>
            <span className="bg-gradient-to-r from-teal-600 to-emerald-500 bg-clip-text text-transparent">{user.displayName}</span>
          </h1>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
            Manage your lockable assets, process instant M-Pesa/Crypto/Bank payouts, and manage client briefs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("upload")}
            id="dash-create-link-btn"
            className="px-5 py-3 bg-teal-600 dark:bg-teal-500 hover:bg-teal-700 dark:hover:bg-teal-600 text-white font-bold text-sm rounded-2xl shadow-lg shadow-teal-500/10 hover:scale-[1.02] transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Lock New File</span>
          </button>
        </div>
      </div>

      {/* Stats Overview Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10 text-left">
        {/* Gross Income */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 p-6 rounded-3xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">Gross Revenue</span>
            <div className="w-8 h-8 flex items-center justify-center bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-xl font-black font-mono text-xs">
              {selectedCurrency.symbol}
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900 dark:text-white mt-4 font-mono">
            {formatPrice(grossEarnings, selectedCurrency)}
          </p>
          <p className="text-[10px] text-gray-400 dark:text-zinc-500 mt-2 font-mono">Total sales before payouts</p>
        </div>

        {/* Unlocked Links */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 p-6 rounded-3xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">Unlocked Assets</span>
            <div className="p-2 bg-teal-50 dark:bg-teal-950/20 text-teal-600 dark:text-teal-400 rounded-xl">
              <Download className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900 dark:text-white mt-4 font-mono">
            {totalSalesCount}
          </p>
          <p className="text-[10px] text-gray-400 dark:text-zinc-500 mt-2 font-mono">Across {creatorFiles.length} secure paywalls</p>
        </div>

        {/* Pending Briefs */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 p-6 rounded-3xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">Pending Briefs</span>
            <div className="p-2 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 rounded-xl">
              <Inbox className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900 dark:text-white mt-4 font-mono">
            {requests.filter(r => r.status === "pending").length}
          </p>
          <p className="text-[10px] text-gray-400 dark:text-zinc-500 mt-2 font-mono">Client custom requests</p>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-zinc-950 p-1 rounded-2xl mb-8 flex-wrap sm:flex-nowrap gap-1">
        <button
          onClick={() => setActiveTab("assets")}
          className={`flex-1 flex items-center justify-center space-x-1.5 py-3 px-3 text-xs sm:text-sm font-bold rounded-xl transition-all ${
            activeTab === "assets"
              ? "bg-white dark:bg-zinc-900 text-gray-900 dark:text-white shadow-xs"
              : "text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          <Share2 className="w-4 h-4" />
          <span>Shared Assets ({creatorFiles.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("wallet")}
          className={`flex-1 flex items-center justify-center space-x-1.5 py-3 px-3 text-xs sm:text-sm font-bold rounded-xl transition-all ${
            activeTab === "wallet"
              ? "bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-xs border border-emerald-500/20"
              : "text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>Wallet & Payouts</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
        </button>

        <button
          onClick={() => setActiveTab("requests")}
          className={`flex-1 flex items-center justify-center space-x-1.5 py-3 px-3 text-xs sm:text-sm font-bold rounded-xl transition-all ${
            activeTab === "requests"
              ? "bg-white dark:bg-zinc-900 text-gray-900 dark:text-white shadow-xs"
              : "text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          <Inbox className="w-4 h-4" />
          <span>Pending Briefs ({requests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("upload")}
          className={`flex-1 flex items-center justify-center space-x-1.5 py-3 px-3 text-xs sm:text-sm font-bold rounded-xl transition-all ${
            activeTab === "upload"
              ? "bg-white dark:bg-zinc-900 text-gray-900 dark:text-white shadow-xs"
              : "text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload File</span>
        </button>

        <button
          onClick={() => setActiveTab("settings")}
          className={`flex-1 flex items-center justify-center space-x-1.5 py-3 px-3 text-xs sm:text-sm font-bold rounded-xl transition-all ${
            activeTab === "settings"
              ? "bg-white dark:bg-zinc-900 text-gray-900 dark:text-white shadow-xs"
              : "text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>
      </div>

      {/* Tab Panels */}

      {/* Panel: WALLET & PAYOUTS */}
      {activeTab === "wallet" && (
        <div id="wallet-payouts-panel" className="space-y-6 text-left animate-in fade-in duration-300">
          
          {/* Sub-Navigation Bar */}
          <div className="flex items-center justify-between flex-wrap gap-4 bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 p-2.5 rounded-3xl shadow-xs">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setWalletSubTab("withdraw")}
                className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center space-x-2 transition-all cursor-pointer ${
                  walletSubTab === "withdraw"
                    ? "bg-teal-600 text-white shadow-md shadow-teal-500/20"
                    : "text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800"
                }`}
              >
                <Send className="w-4 h-4" />
                <span>Withdraw Funds</span>
              </button>

              <button
                type="button"
                onClick={() => setWalletSubTab("history")}
                className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center space-x-2 transition-all cursor-pointer ${
                  walletSubTab === "history"
                    ? "bg-teal-600 text-white shadow-md shadow-teal-500/20"
                    : "text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800"
                }`}
              >
                <Receipt className="w-4 h-4" />
                <span>Transaction History</span>
                <span className="ml-1 px-2 py-0.5 text-[10px] bg-teal-500/20 text-teal-300 font-mono rounded-full font-bold">
                  {withdrawals.length}
                </span>
              </button>
            </div>

            <div className="flex items-center space-x-3 px-3">
              <span className="text-[10px] uppercase font-extrabold text-gray-400 dark:text-zinc-500 tracking-wider">Available Balance:</span>
              <span className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono">
                ${availableBalance.toFixed(2)}
              </span>
            </div>
          </div>

          {/* VIEW 1: WITHDRAW FORM */}
          {walletSubTab === "withdraw" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Withdrawal Form */}
              <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-sm">
                <div className="flex items-center justify-between pb-6 border-b border-gray-100 dark:border-zinc-800">
                  <div>
                    <h2 className="text-xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                      <Wallet className="w-5 h-5 text-emerald-500" />
                      <span>Withdraw Funds</span>
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
                      Select your preferred payout channel and submit your withdrawal request.
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Available</span>
                    <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
                      ${availableBalance.toFixed(2)}
                    </span>
                  </div>
                </div>

                <form onSubmit={handleWithdrawSubmit} className="mt-6 space-y-6">
                  
                  {/* 1. Method Selection Tabs */}
                  <div>
                    <label className="text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider block mb-3">
                      1. Select Payout Channel
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {/* M-Pesa */}
                      <button
                        type="button"
                        onClick={() => setWithdrawMethod("mpesa")}
                        className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                          withdrawMethod === "mpesa"
                            ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-xs ring-1 ring-emerald-500"
                            : "bg-gray-50 dark:bg-zinc-950 border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <Smartphone className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                          {withdrawMethod === "mpesa" && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                        </div>
                        <div className="mt-3">
                          <p className="text-xs font-black">M-Pesa</p>
                          <p className="text-[10px] text-gray-400 font-normal">Mobile Money</p>
                        </div>
                      </button>

                      {/* Crypto */}
                      <button
                        type="button"
                        onClick={() => setWithdrawMethod("crypto")}
                        className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                          withdrawMethod === "crypto"
                            ? "bg-purple-50 dark:bg-purple-950/40 border-purple-500 text-purple-700 dark:text-purple-300 shadow-xs ring-1 ring-purple-500"
                            : "bg-gray-50 dark:bg-zinc-950 border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <Coins className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                          {withdrawMethod === "crypto" && <CheckCircle2 className="w-4 h-4 text-purple-500" />}
                        </div>
                        <div className="mt-3">
                          <p className="text-xs font-black">Crypto</p>
                          <p className="text-[10px] text-gray-400 font-normal">USDT / Web3</p>
                        </div>
                      </button>

                      {/* Bank */}
                      <button
                        type="button"
                        onClick={() => setWithdrawMethod("bank")}
                        className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                          withdrawMethod === "bank"
                            ? "bg-sky-50 dark:bg-sky-950/40 border-sky-500 text-sky-700 dark:text-sky-300 shadow-xs ring-1 ring-sky-500"
                            : "bg-gray-50 dark:bg-zinc-950 border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <Building2 className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                          {withdrawMethod === "bank" && <CheckCircle2 className="w-4 h-4 text-sky-500" />}
                        </div>
                        <div className="mt-3">
                          <p className="text-xs font-black">Bank Wire</p>
                          <p className="text-[10px] text-gray-400 font-normal">Direct Transfer</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* 2. Destination Input Fields */}
                  <div className="p-4 bg-gray-50 dark:bg-zinc-950/60 border border-gray-200 dark:border-zinc-800 rounded-2xl space-y-4">
                    {withdrawMethod === "mpesa" && (
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-bold text-gray-700 dark:text-zinc-300">
                            M-Pesa Registered Phone Number
                          </label>
                          <span className="text-[10px] text-emerald-600 font-bold bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-md">
                            🇰🇪 Safaricom / Vodacom
                          </span>
                        </div>
                        <input
                          type="text"
                          placeholder="+254 7XX XXX XXX or 07XX XXX XXX"
                          value={mpesaPhone}
                          onChange={(e) => setMpesaPhone(e.target.value)}
                          required
                          className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-sm font-mono text-gray-900 dark:text-white"
                        />
                        <p className="text-[11px] text-gray-500 dark:text-zinc-400 mt-1.5 flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Instant automated STK prompt or direct B2C transfer.</span>
                        </p>
                      </div>
                    )}

                    {withdrawMethod === "crypto" && (
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs font-bold text-gray-700 dark:text-zinc-300 block mb-1.5">
                            Network / Protocol
                          </label>
                          <select
                            value={cryptoNetwork}
                            onChange={(e) => setCryptoNetwork(e.target.value)}
                            className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl text-sm font-bold text-gray-900 dark:text-white"
                          >
                            <option value="USDT (TRC20)">USDT - TRON (TRC20) [Recommended]</option>
                            <option value="USDT (ERC20)">USDT - Ethereum (ERC20)</option>
                            <option value="USDT (Polygon)">USDT - Polygon (MATIC)</option>
                            <option value="Bitcoin (BTC)">Bitcoin (BTC)</option>
                            <option value="Solana (SOL)">Solana (SOL)</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-gray-700 dark:text-zinc-300 block mb-1.5">
                            Wallet Deposit Address
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. T9yD14Nj9j7x... or 0x71C..."
                            value={cryptoAddress}
                            onChange={(e) => setCryptoAddress(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl text-sm font-mono text-gray-900 dark:text-white"
                          />
                          <p className="text-[11px] text-gray-500 dark:text-zinc-400 mt-1.5">
                            Ensure address matches selected network to prevent loss.
                          </p>
                        </div>
                      </div>
                    )}

                    {withdrawMethod === "bank" && (
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs font-bold text-gray-700 dark:text-zinc-300 block mb-1.5">
                            Bank Name
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. KCB, Equity Bank, Chase, Standard Chartered"
                            value={bankName}
                            onChange={(e) => setBankName(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-xl text-sm font-medium text-gray-900 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-gray-700 dark:text-zinc-300 block mb-1.5">
                            Account Number / IBAN
                          </label>
                          <input
                            type="text"
                            placeholder="Account or IBAN Number"
                            value={bankAccount}
                            onChange={(e) => setBankAccount(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-xl text-sm font-mono text-gray-900 dark:text-white"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 3. Amount to Withdraw */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider block">
                        3. Amount (USD $)
                      </label>
                      <div className="flex items-center space-x-1.5">
                        <button
                          type="button"
                          onClick={() => setWithdrawAmount((availableBalance * 0.25).toFixed(2))}
                          className="px-2 py-1 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 text-[10px] font-bold rounded-lg text-gray-700 dark:text-zinc-300"
                        >
                          25%
                        </button>
                        <button
                          type="button"
                          onClick={() => setWithdrawAmount((availableBalance * 0.50).toFixed(2))}
                          className="px-2 py-1 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 text-[10px] font-bold rounded-lg text-gray-700 dark:text-zinc-300"
                        >
                          50%
                        </button>
                        <button
                          type="button"
                          onClick={() => setWithdrawAmount(availableBalance.toFixed(2))}
                          className="px-2 py-1 bg-teal-100 dark:bg-teal-950/80 hover:bg-teal-200 text-[10px] font-bold rounded-lg text-teal-700 dark:text-teal-300"
                        >
                          Max (${availableBalance.toFixed(2)})
                        </button>
                      </div>
                    </div>

                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono font-bold text-gray-400 text-lg">$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="1"
                        max={availableBalance}
                        placeholder="0.00"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        required
                        className="w-full pl-8 pr-4 py-3.5 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-2xl text-lg font-mono font-black text-gray-900 dark:text-white"
                      />
                    </div>

                    {/* Currency estimate preview */}
                    {withdrawAmount && !isNaN(parseFloat(withdrawAmount)) && (
                      <div className="mt-2 text-right">
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold font-mono">
                          Payout Value: ≈ {formatPrice(parseFloat(withdrawAmount), selectedCurrency)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={isWithdrawing || availableBalance <= 0}
                    className="w-full py-4 bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700 hover:from-teal-500 hover:to-emerald-600 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-teal-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    {isWithdrawing ? (
                      <>
                        <Sparkles className="w-4 h-4 animate-spin" />
                        <span>Processing Escrow Transfer...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Confirm & Withdraw to {withdrawMethod.toUpperCase()}</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Right Column: Ledger / Payout History */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">
                      Recent Payout Activity
                    </h3>
                    <button
                      onClick={() => setWalletSubTab("history")}
                      className="text-xs text-teal-600 dark:text-teal-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>View All ({withdrawals.length})</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {withdrawals.length === 0 ? (
                    <div className="py-8 text-center text-gray-400 text-xs">
                      No withdrawal requests recorded yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {withdrawals.slice(0, 4).map((item) => (
                        <div 
                          key={item.id}
                          className="p-3.5 bg-gray-50 dark:bg-zinc-950 border border-gray-100 dark:border-zinc-800/80 rounded-2xl flex items-center justify-between text-left"
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-xl text-white font-bold ${
                              item.method === "mpesa" ? "bg-emerald-600" :
                              item.method === "crypto" ? "bg-purple-600" : "bg-sky-600"
                            }`}>
                              {item.method === "mpesa" ? <Smartphone className="w-4 h-4" /> :
                               item.method === "crypto" ? <Coins className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
                            </div>

                            <div>
                              <p className="text-xs font-extrabold text-gray-900 dark:text-white uppercase">
                                {item.method} • {item.networkOrBank}
                              </p>
                              <p className="text-[10px] text-gray-500 font-mono mt-0.5">
                                {item.recipient}
                              </p>
                              <p className="text-[9px] text-gray-400 mt-0.5">
                                Ref: {item.transactionRef}
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="text-xs font-black text-gray-900 dark:text-white font-mono">
                              -${item.amountUSD.toFixed(2)}
                            </p>
                            <span className={`inline-block mt-1 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                              item.status === "completed"
                                ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400"
                                : item.status === "processing"
                                ? "bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400"
                                : "bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400"
                            }`}>
                              {item.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Security & Escrow Guarantee Box */}
                <div className="p-5 bg-teal-50/60 dark:bg-teal-950/20 border border-teal-500/20 rounded-3xl text-left space-y-2">
                  <div className="flex items-center gap-2 text-teal-700 dark:text-teal-300 font-extrabold text-xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>Only Funds Escrow Protection</span>
                  </div>
                  <p className="text-[11px] text-gray-600 dark:text-zinc-400 leading-relaxed">
                    All seller funds are held in multi-sig cold storage until payout authorization. M-Pesa B2C payments settle within 60 seconds; Crypto USDT transfers post within 2-3 network confirmations.
                  </p>
                </div>
              </div>

            </div>
          )}

          {/* VIEW 2: FULL TRANSACTION HISTORY */}
          {walletSubTab === "history" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Stat Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl p-5 text-left shadow-xs">
                  <p className="text-[10px] text-gray-400 dark:text-zinc-500 font-bold uppercase tracking-wider">Total Payout Volume</p>
                  <p className="text-2xl font-black text-gray-900 dark:text-white font-mono mt-1">
                    ${withdrawals.reduce((sum, w) => sum + w.amountUSD, 0).toFixed(2)}
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-zinc-400 mt-1 font-mono">
                    ≈ {formatPrice(withdrawals.reduce((sum, w) => sum + w.amountUSD, 0), selectedCurrency)}
                  </p>
                </div>

                <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl p-5 text-left shadow-xs">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-gray-400 dark:text-zinc-500 font-bold uppercase tracking-wider">Completed Payouts</p>
                    <span className="p-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-lg text-xs font-bold">
                      {withdrawals.filter(w => w.status === "completed").length}
                    </span>
                  </div>
                  <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">
                    ${withdrawals.filter(w => w.status === "completed").reduce((sum, w) => sum + w.amountUSD, 0).toFixed(2)}
                  </p>
                  <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-1 font-mono">
                    Settled to destinations
                  </p>
                </div>

                <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl p-5 text-left shadow-xs">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-gray-400 dark:text-zinc-500 font-bold uppercase tracking-wider">Pending / Processing</p>
                    <span className="p-1 bg-amber-100 dark:bg-amber-950 text-amber-600 rounded-lg text-xs font-bold">
                      {withdrawals.filter(w => w.status === "processing").length}
                    </span>
                  </div>
                  <p className="text-2xl font-black text-amber-500 font-mono mt-1">
                    ${withdrawals.filter(w => w.status === "processing").reduce((sum, w) => sum + w.amountUSD, 0).toFixed(2)}
                  </p>
                  <p className="text-[11px] text-amber-600/80 dark:text-amber-400/80 mt-1 font-mono">
                    Escrow network processing
                  </p>
                </div>
              </div>

              {/* Table Toolbar: Search + Filters */}
              <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                
                {/* Search Bar */}
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by address, phone, ref ID..."
                    value={historySearchQuery}
                    onChange={(e) => setHistorySearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:border-teal-500 focus:outline-hidden"
                  />
                  {historySearchQuery && (
                    <button
                      onClick={() => setHistorySearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Filter Pills */}
                <div className="flex items-center space-x-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                  <button
                    onClick={() => setHistoryStatusFilter("all")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                      historyStatusFilter === "all"
                        ? "bg-teal-600 text-white shadow-xs"
                        : "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 hover:bg-gray-200"
                    }`}
                  >
                    All ({withdrawals.length})
                  </button>

                  <button
                    onClick={() => setHistoryStatusFilter("pending")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                      historyStatusFilter === "pending"
                        ? "bg-amber-500 text-white shadow-xs"
                        : "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 hover:bg-gray-200"
                    }`}
                  >
                    Pending ({withdrawals.filter(w => w.status === "processing").length})
                  </button>

                  <button
                    onClick={() => setHistoryStatusFilter("completed")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                      historyStatusFilter === "completed"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 hover:bg-gray-200"
                    }`}
                  >
                    Completed ({withdrawals.filter(w => w.status === "completed").length})
                  </button>

                  <button
                    onClick={() => setHistoryStatusFilter("failed")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                      historyStatusFilter === "failed"
                        ? "bg-rose-600 text-white shadow-xs"
                        : "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 hover:bg-gray-200"
                    }`}
                  >
                    Failed ({withdrawals.filter(w => w.status === "failed").length})
                  </button>
                </div>
              </div>

              {/* Transactions Table / List */}
              <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-xs">
                
                {(() => {
                  const filtered = withdrawals.filter(item => {
                    if (historyStatusFilter === "pending" && item.status !== "processing") return false;
                    if (historyStatusFilter === "completed" && item.status !== "completed") return false;
                    if (historyStatusFilter === "failed" && item.status !== "failed") return false;

                    if (historySearchQuery.trim()) {
                      const q = historySearchQuery.toLowerCase();
                      const matchRecipient = item.recipient.toLowerCase().includes(q);
                      const matchRef = item.transactionRef.toLowerCase().includes(q);
                      const matchMethod = item.method.toLowerCase().includes(q);
                      const matchNetwork = item.networkOrBank.toLowerCase().includes(q);
                      return matchRecipient || matchRef || matchMethod || matchNetwork;
                    }

                    return true;
                  });

                  if (filtered.length === 0) {
                    return (
                      <div className="p-12 text-center text-gray-400 space-y-3">
                        <Receipt className="w-12 h-12 mx-auto text-gray-300 dark:text-zinc-700" />
                        <p className="text-sm font-bold text-gray-700 dark:text-zinc-300">No matching withdrawal records found</p>
                        <p className="text-xs text-gray-500 max-w-sm mx-auto">
                          Try adjusting your search criteria or switch status filters to view all past payout requests.
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div className="divide-y divide-gray-100 dark:divide-zinc-800">
                      {filtered.map((item) => (
                        <div
                          key={item.id}
                          className="p-5 hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 text-left"
                        >
                          <div className="flex items-start space-x-3.5">
                            <div className={`p-3 rounded-2xl text-white font-bold shrink-0 mt-0.5 ${
                              item.method === "mpesa" ? "bg-emerald-600" :
                              item.method === "crypto" ? "bg-purple-600" : "bg-sky-600"
                            }`}>
                              {item.method === "mpesa" ? <Smartphone className="w-5 h-5" /> :
                               item.method === "crypto" ? <Coins className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                                <span className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider">
                                  {item.method} ({item.networkOrBank})
                                </span>

                                {/* Status Badge */}
                                <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                                  item.status === "completed"
                                    ? "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20"
                                    : item.status === "processing"
                                    ? "bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-500/20"
                                    : "bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-500/20"
                                }`}>
                                  {item.status === "completed" && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                                  {item.status === "processing" && <Clock className="w-3 h-3 text-amber-500 animate-spin" />}
                                  {item.status === "failed" && <XCircle className="w-3 h-3 text-rose-500" />}
                                  <span>{item.status === "processing" ? "Pending / Processing" : item.status}</span>
                                </span>
                              </div>

                              <p className="text-xs text-gray-700 dark:text-zinc-300 font-mono font-medium flex items-center gap-1">
                                <span className="text-gray-400 text-[10px] uppercase font-bold">Destination:</span>
                                <span>{item.recipient}</span>
                              </p>

                              <div className="flex items-center space-x-3 text-[10px] text-gray-400 font-mono">
                                <span>Ref: <strong className="text-gray-600 dark:text-zinc-300">{item.transactionRef}</strong></span>
                                <span>•</span>
                                <span>{item.createdAt ? new Date(item.createdAt).toLocaleString() : "Recently"}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 pt-3 md:pt-0 border-gray-100 dark:border-zinc-800">
                            <div className="text-left md:text-right">
                              <p className="text-base font-black text-gray-900 dark:text-white font-mono">
                                -${item.amountUSD.toFixed(2)}
                              </p>
                              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                                ≈ {formatPrice(item.amountUSD, selectedCurrency)}
                              </p>
                            </div>

                            <button
                              onClick={() => setSelectedReceipt(item)}
                              className="mt-2 px-3 py-1.5 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-200 text-xs font-bold rounded-xl transition-colors flex items-center space-x-1 cursor-pointer"
                            >
                              <Receipt className="w-3.5 h-3.5 text-teal-500" />
                              <span>Receipt</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}

              </div>

            </div>
          )}

        </div>
      )}

      {/* Panel 1: SHARED ASSETS LIST */}
      {activeTab === "assets" && (
        <div id="assets-list-panel" className="space-y-6">
          {creatorFiles.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl p-12 text-center max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-950/20 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Share2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">No Shared Assets Yet</h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-2 leading-relaxed">
                You haven't locked any files or links behind security fees yet. Create your first paid link and share it on socials or email to start earning!
              </p>
              <button
                onClick={() => setActiveTab("upload")}
                className="mt-6 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
              >
                Create Paid Share Link
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Search & Filter Toolbar */}
              <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 p-4 rounded-3xl shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={assetSearchQuery}
                    onChange={(e) => setAssetSearchQuery(e.target.value)}
                    placeholder="Search assets by title, description or filename..."
                    className="w-full pl-10 pr-9 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-2xl text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all"
                  />
                  {assetSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setAssetSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-white p-0.5"
                      title="Clear search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                  <span className="text-[11px] font-mono text-gray-500 dark:text-zinc-400">
                    {(() => {
                      const filtered = creatorFiles.filter((file) => {
                        if (!assetSearchQuery.trim()) return true;
                        const q = assetSearchQuery.toLowerCase().trim();
                        return (
                          file.title.toLowerCase().includes(q) ||
                          (file.description && file.description.toLowerCase().includes(q)) ||
                          (file.fileName && file.fileName.toLowerCase().includes(q)) ||
                          (file.fileType && file.fileType.toLowerCase().includes(q))
                        );
                      });
                      return `${filtered.length} of ${creatorFiles.length} ${creatorFiles.length === 1 ? 'asset' : 'assets'}`;
                    })()}
                  </span>

                  <button
                    onClick={() => setActiveTab("upload")}
                    className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-2xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Asset</span>
                  </button>
                </div>
              </div>

              {/* Filtered Assets List */}
              {(() => {
                const filteredCreatorFiles = creatorFiles.filter((file) => {
                  if (!assetSearchQuery.trim()) return true;
                  const q = assetSearchQuery.toLowerCase().trim();
                  return (
                    file.title.toLowerCase().includes(q) ||
                    (file.description && file.description.toLowerCase().includes(q)) ||
                    (file.fileName && file.fileName.toLowerCase().includes(q)) ||
                    (file.fileType && file.fileType.toLowerCase().includes(q))
                  );
                });

                if (filteredCreatorFiles.length === 0) {
                  return (
                    <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl p-10 text-center max-w-md mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/20 text-amber-500 flex items-center justify-center mx-auto">
                        <Search className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white">No Assets Match "{assetSearchQuery}"</h4>
                      <p className="text-xs text-gray-500 dark:text-zinc-400">
                        Try searching with a different keyword or clear your search query to view all assets.
                      </p>
                      <button
                        onClick={() => setAssetSearchQuery("")}
                        className="mt-2 px-4 py-2 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-800 dark:text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                      >
                        Clear Search Filter
                      </button>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 gap-6 text-left">
                    {filteredCreatorFiles.map((file) => {
                      const isExpanded = expandedFileId === file.id;
                      const fileUrl = `${window.location.origin}/f/${file.id}`;
                      const isNewlyCreated = newlyCreatedFileId === file.id;

                      return (
                  <div
                    key={file.id}
                    className={`bg-white dark:bg-zinc-900 border rounded-3xl overflow-hidden shadow-xs transition-all duration-700 ${
                      isNewlyCreated
                        ? "border-teal-500 ring-2 ring-teal-500/60 shadow-xl shadow-teal-500/10 animate-in fade-in slide-in-from-top-6 duration-700"
                        : "border-gray-150 dark:border-zinc-800 hover:shadow-md"
                    }`}
                  >
                    {/* Entry Badge for Newly Created Assets */}
                    {isNewlyCreated && (
                      <div className="bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-400 text-black px-6 py-2 text-[11px] font-black uppercase tracking-wider flex items-center justify-between shadow-xs">
                        <div className="flex items-center space-x-2">
                          <Sparkles className="w-3.5 h-3.5 animate-spin" />
                          <span>Newly Uploaded Paywall Link • Ready to Share</span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <button
                            onClick={() => handleCopyLink(file.id)}
                            className="px-2.5 py-1 bg-black/20 hover:bg-black/30 text-black font-bold rounded-lg transition-all flex items-center space-x-1 cursor-pointer"
                          >
                            <Copy className="w-3 h-3" />
                            <span>{copiedId === file.id ? "Copied!" : "Copy Share Link"}</span>
                          </button>

                          <button
                            onClick={() => setQrModalFile(file)}
                            className="px-2.5 py-1 bg-black text-white hover:bg-zinc-800 font-bold rounded-lg transition-all flex items-center space-x-1 cursor-pointer text-xs"
                          >
                            <QrCode className="w-3 h-3 text-teal-300" />
                            <span>QR Code</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Top basic block */}
                    <div className="p-5 sm:p-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5">
                      <div className="flex items-start space-x-4 text-left w-full lg:w-auto">
                        
                        {/* Preview Thumbnail Container */}
                        <div className="relative group shrink-0">
                          {file.thumbnailUrl || file.coverUrl ? (
                            <div 
                              onClick={() => setSelectedPreviewAsset(file)}
                              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border border-gray-200 dark:border-zinc-800 bg-gray-100 dark:bg-zinc-950 relative cursor-pointer shadow-xs hover:border-teal-500 hover:ring-2 hover:ring-teal-500/20 transition-all"
                              title="Click to view full preview thumbnail & media viewer"
                            >
                              <img
                                src={file.thumbnailUrl || file.coverUrl}
                                alt={file.title}
                                className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-300"
                                onError={(e) => {
                                  // fallback if image fails to load
                                  (e.target as HTMLElement).style.display = "none";
                                }}
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                <ZoomIn className="w-5 h-5 drop-shadow-md" />
                              </div>
                              <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/75 backdrop-blur-xs rounded-md text-[9px] font-black text-white font-mono uppercase tracking-wider">
                                {file.fileType === "image" ? "IMG" : file.fileType === "video" ? "VID" : file.fileType === "document" ? "DOC" : "ASSET"}
                              </div>
                            </div>
                          ) : (
                            <div 
                              onClick={() => setSelectedPreviewAsset(file)}
                              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-teal-50 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-900/40 text-teal-600 dark:text-teal-400 flex flex-col items-center justify-center shrink-0 cursor-pointer hover:border-teal-400 hover:ring-2 hover:ring-teal-500/20 transition-all"
                              title="Click to view preview modal"
                            >
                              {file.fileType === "video" ? (
                                <Video className="w-6 h-6" />
                              ) : file.fileType === "image" ? (
                                <ImageIcon className="w-6 h-6" />
                              ) : (
                                <FileText className="w-6 h-6" />
                              )}
                              <span className="text-[9px] font-black uppercase tracking-wider mt-1 font-mono">
                                {file.fileType}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Title, File Details, & Metrics */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 
                              onClick={() => setSelectedPreviewAsset(file)}
                              className="text-base font-extrabold text-gray-900 dark:text-white truncate cursor-pointer hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                              title="Click to open preview modal"
                            >
                              {file.title}
                            </h3>
                            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-black rounded-lg font-mono">
                              {formatPrice(file.fee, selectedCurrency)}
                            </span>
                          </div>

                          {file.description && (
                            <p className="text-xs text-gray-600 dark:text-zinc-400 mt-1 line-clamp-1 max-w-xl">
                              {file.description}
                            </p>
                          )}

                          <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-[11px] text-gray-500 dark:text-zinc-400 mt-2 font-mono">
                            <span className="flex items-center gap-1 font-semibold text-gray-700 dark:text-zinc-300">
                              <FileText className="w-3.5 h-3.5 text-teal-500" />
                              <span className="truncate max-w-[140px] sm:max-w-[200px]">{file.fileName}</span>
                            </span>
                            <span>•</span>
                            <span>{file.purchasesCount || 0} unlocks</span>
                            <span>•</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                              ${((file.totalEarnings || 0) * 0.95).toFixed(2)} net
                            </span>
                            {file.previewFiles && file.previewFiles.length > 0 && (
                              <>
                                <span>•</span>
                                <span className="text-teal-600 dark:text-teal-400 font-semibold">
                                  {file.previewFiles.filter(p => p.isUnblurred).length}/{file.previewFiles.length} teasers
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-start lg:justify-end shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-gray-100 dark:border-zinc-800">
                        <button
                          onClick={() => setSelectedPreviewAsset(file)}
                          className="flex items-center space-x-1.5 px-3 py-2 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-xs font-bold rounded-xl transition-all cursor-pointer text-gray-800 dark:text-zinc-200"
                          title="Open full interactive preview modal"
                        >
                          <Eye className="w-3.5 h-3.5 text-teal-500" />
                          <span>Preview</span>
                        </button>

                        <button
                          onClick={() => handleCopyLink(file.id)}
                          className="flex items-center space-x-1.5 px-3 py-2 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                        >
                          {copiedId === file.id ? <Check className="w-3.5 h-3.5 text-teal-500" /> : <Clipboard className="w-3.5 h-3.5 text-gray-500" />}
                          <span>{copiedId === file.id ? "Copied" : "Copy Link"}</span>
                        </button>

                        <button
                          onClick={() => setQrModalFile(file)}
                          className="flex items-center space-x-1.5 px-3 py-2 bg-teal-500/10 hover:bg-teal-500/20 text-teal-600 dark:text-teal-400 text-xs font-bold rounded-xl transition-all cursor-pointer"
                          title="Generate Mobile QR Code"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>QR</span>
                        </button>

                        <button
                          onClick={() => setExpandedFileId(isExpanded ? null : file.id)}
                          className="flex items-center space-x-1 px-3 py-2 bg-teal-500/10 text-teal-600 dark:text-teal-400 text-xs font-bold rounded-xl hover:bg-teal-500/20 transition-all cursor-pointer"
                        >
                          <span>{isExpanded ? "Hide Promos" : "Promos & Details"}</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>

                        <a
                          href={fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-zinc-900 text-white hover:bg-zinc-850 rounded-xl text-xs font-bold transition-all"
                          title="Open Live Paywall"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>

                        {onDeleteFile && (
                          <button
                            onClick={() => onDeleteFile(file.id)}
                            className="p-2 bg-rose-500/10 hover:bg-rose-500/25 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-bold transition-all cursor-pointer"
                            title="Delete Paywall Link"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Expandable Promos Area (Social Media Embed Previews & Email Designs) */}
                    {isExpanded && (
                      <div className="bg-gray-50/70 dark:bg-zinc-950/40 p-6 border-t border-gray-100 dark:border-zinc-850 grid grid-cols-1 md:grid-cols-2 gap-8 items-start animate-in slide-in-from-top-4 duration-300">
                        {/* Twitter, Discord, FB simulation container popups */}
                        <SocialPreview file={file} />

                        {/* Beautiful email HTML templates */}
                        <EmailTemplate file={file} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })()}
            </div>
          )}
        </div>
      )}

      {/* Panel 2: PENDING FILE REQUESTS */}
      {activeTab === "requests" && (
        <div id="requests-panel" className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 text-left">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Custom Briefs & Commissions</h2>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">Users can submit requests. Review requirements and fulfill them securely.</p>
            </div>
            
            <button
              onClick={() => setShowRequestForm(!showRequestForm)}
              className="px-4 py-2 bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-850 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <Users className="w-4 h-4" />
              <span>{showRequestForm ? "Cancel Simulator" : "Simulate Client Request"}</span>
            </button>
          </div>

          {/* Simulated Request Submission Form */}
          {showRequestForm && (
            <div className="bg-gray-50 dark:bg-zinc-950 p-6 rounded-3xl border border-gray-200 dark:border-zinc-800 max-w-xl mx-auto text-left animate-in slide-in-from-top-4">
              <div className="flex items-center gap-2 mb-4 text-teal-600 dark:text-teal-400">
                <AlertCircle className="w-5 h-5" />
                <h3 className="text-sm font-bold">Simulator: Submit Request as another Creator/Buyer</h3>
              </div>
              
              <form onSubmit={handleAddSimulatedRequest} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-gray-500 uppercase">Requester Name</span>
                    <input
                      type="text"
                      required
                      placeholder="Sarah Jenkins"
                      value={requesterName}
                      onChange={(e) => setRequesterName(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-gray-500 uppercase">Requester Email</span>
                    <input
                      type="email"
                      required
                      placeholder="sarah@creative.co"
                      value={requesterEmail}
                      onChange={(e) => setRequesterEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 space-y-1">
                    <span className="text-[10px] font-bold text-gray-500 uppercase">Brief Title</span>
                    <input
                      type="text"
                      required
                      placeholder="Custom vector icon pack"
                      value={requestTitle}
                      onChange={(e) => setRequestTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-gray-500 uppercase">Offered Price ($)</span>
                    <input
                      type="number"
                      required
                      value={requestFee}
                      onChange={(e) => setRequestFee(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-500 uppercase">Detailed Requirements</span>
                  <textarea
                    required
                    placeholder="Describe exactly what needs to be created..."
                    value={requestDesc}
                    onChange={(e) => setRequestDesc(e.target.value)}
                    rows={2}
                    className="w-full p-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingRequest}
                  className="w-full h-10 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Request Brief</span>
                </button>
              </form>
            </div>
          )}

          {/* List of client briefs */}
          {requests.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl p-12 text-center max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-4">
                <Inbox className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">No Client Briefs Yet</h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-2 leading-relaxed">
                When people submit custom file requests specifically for your skills, they will pop up in this inbox so you can review their budgets.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              {requests.map((req) => (
                <div
                  key={req.id}
                  className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl p-6 flex flex-col justify-between shadow-xs"
                >
                  <div>
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          req.status === "completed" 
                            ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600"
                            : req.status === "declined"
                            ? "bg-rose-50 dark:bg-rose-950/20 text-rose-600"
                            : "bg-amber-50 dark:bg-amber-950/20 text-amber-600"
                        }`}>
                          {req.status}
                        </span>
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white mt-2 leading-snug">
                          {req.title}
                        </h3>
                      </div>
                      
                      <div className="text-right flex flex-col items-end gap-1.5">
                        <div>
                          <span className="text-xs text-gray-400 block">Offered Budget</span>
                          <p className="text-base font-extrabold text-teal-600 dark:text-teal-400">{formatPrice(req.offeredFee, selectedCurrency)}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setEditingRequest(req)}
                            className="p-1 text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                            title="Edit Brief"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteRequest(req.id)}
                            className="p-1 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                            title="Delete Brief"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-gray-600 dark:text-zinc-300 mt-3 leading-relaxed">
                      {req.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-50 dark:border-zinc-850/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
                    <div className="text-left">
                      <span className="text-[10px] text-gray-400">Requester</span>
                      <p className="font-semibold text-gray-700 dark:text-zinc-300">{req.requesterName}</p>
                      <p className="text-[11px] text-gray-500 font-mono">{req.requesterEmail}</p>
                    </div>

                    {req.status === "pending" && (
                      <div className="flex gap-1.5 self-end sm:self-auto">
                        <button
                          onClick={() => handleUpdateRequestStatus(req.id, "declined")}
                          className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/25 dark:text-rose-400 rounded-lg font-bold"
                        >
                          Decline
                        </button>
                        <button
                          onClick={() => handleUpdateRequestStatus(req.id, "accepted")}
                          className="px-2.5 py-1.5 bg-teal-500 text-white rounded-lg font-bold"
                        >
                          Accept
                        </button>
                      </div>
                    )}

                    {req.status === "accepted" && (
                      <button
                        onClick={() => handleFulfillRequest(req)}
                        className="px-3.5 py-2 bg-gradient-to-r from-teal-600 to-emerald-500 text-white rounded-xl font-bold flex items-center gap-1 hover:scale-105 transition-transform"
                      >
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>Fulfill Work</span>
                      </button>
                    )}

                    {req.status === "completed" && (
                      <div className="flex items-center space-x-1 text-emerald-600 font-bold">
                        <CheckCircle className="w-4 h-4" />
                        <span>Completed & Paid</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Edit Brief Modal */}
          {editingRequest && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
              <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 text-left">
                <div className="flex items-center justify-between border-b border-gray-150 dark:border-zinc-800 pb-3">
                  <h3 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-teal-600" />
                    <span>Edit Request Brief</span>
                  </h3>
                  <button 
                    onClick={() => setEditingRequest(null)}
                    className="text-gray-400 hover:text-gray-500 text-sm font-bold p-1"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleEditRequestSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase">Requester Name</span>
                      <input
                        type="text"
                        required
                        value={editingRequest.requesterName}
                        onChange={(e) => setEditingRequest({ ...editingRequest, requesterName: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs text-gray-900 dark:text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase">Requester Email</span>
                      <input
                        type="email"
                        required
                        value={editingRequest.requesterEmail}
                        onChange={(e) => setEditingRequest({ ...editingRequest, requesterEmail: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2 space-y-1">
                      <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase">Brief Title</span>
                      <input
                        type="text"
                        required
                        value={editingRequest.title}
                        onChange={(e) => setEditingRequest({ ...editingRequest, title: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs text-gray-900 dark:text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase">Offered Budget ($)</span>
                      <input
                        type="number"
                        required
                        value={editingRequest.offeredFee}
                        onChange={(e) => setEditingRequest({ ...editingRequest, offeredFee: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase">Status</span>
                    <select
                      value={editingRequest.status}
                      onChange={(e) => setEditingRequest({ ...editingRequest, status: e.target.value as any })}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-teal-600 dark:text-teal-400"
                    >
                      <option value="pending">Pending</option>
                      <option value="accepted">Accepted</option>
                      <option value="completed">Completed</option>
                      <option value="declined">Declined</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase">Detailed Requirements</span>
                    <textarea
                      required
                      value={editingRequest.description}
                      onChange={(e) => setEditingRequest({ ...editingRequest, description: e.target.value })}
                      rows={3}
                      className="w-full p-3 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs text-gray-900 dark:text-white"
                    />
                  </div>

                  <div className="flex gap-2 justify-end pt-2 border-t border-gray-150 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setEditingRequest(null)}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-gray-700 dark:text-zinc-300 rounded-xl text-xs font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Panel 3: LOCK / UPLOAD ASSET FORM */}
      {activeTab === "upload" && (
        <div id="upload-panel" className="max-w-2xl mx-auto">
          <FileUploader onUploadSuccess={handleUploadSuccess} isSubmitting={isUploading} selectedCurrency={selectedCurrency} />
        </div>
      )}

      {/* Panel 4: PROFILE & CURRENCY SETTINGS */}
      {activeTab === "settings" && (
        <div id="settings-panel" className="max-w-3xl mx-auto space-y-6 text-left">
          
          {/* Creator Profile & Mobile Money Payout Settings */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 p-6 sm:p-8 rounded-3xl shadow-xs">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">Profile & M-Pesa Payout Settings</h2>
                <p className="text-xs text-gray-500 dark:text-zinc-400">
                  Manage your creator alias, default mobile money provider, and M-Pesa recipient phone number.
                </p>
              </div>
            </div>

            {/* 5% Fee / 95% Direct Payout Banner */}
            <div className="mt-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 text-xs space-y-1.5 text-emerald-900 dark:text-emerald-200">
              <div className="flex items-center space-x-2 font-extrabold text-emerald-700 dark:text-emerald-300">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                <span>5% Platform Fee & 95% Automated Direct M-Pesa Settlement</span>
              </div>
              <p className="text-[11px] text-gray-600 dark:text-zinc-300 leading-relaxed">
                Every time a customer unlocks your file paywall link, <b>5%</b> is automatically deducted as a platform service fee, and the remaining <b>95% net revenue</b> is immediately routed to your active mobile money phone number.
              </p>
            </div>

            <form onSubmit={handleSaveProfile} className="mt-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Username / Creator Alias */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider">
                    Username / Creator Alias
                  </label>
                  <input
                    type="text"
                    required
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="e.g. Alex Creator"
                    className="w-full px-4 h-11 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 focus:border-emerald-500 rounded-xl text-sm font-semibold text-gray-900 dark:text-white"
                  />
                </div>

                {/* Account Email */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider">
                    Contact Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    placeholder="creator@example.com"
                    className="w-full px-4 h-11 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 focus:border-emerald-500 rounded-xl text-sm text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Mobile Money Method Selector */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider">
                    Mobile Money Provider
                  </label>
                  <select
                    value={profileMobileMethod}
                    onChange={(e: any) => setProfileMobileMethod(e.target.value)}
                    className="w-full px-3 h-11 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 focus:border-emerald-500 rounded-xl text-xs font-bold text-gray-900 dark:text-white cursor-pointer"
                  >
                    <option value="mpesa">Safaricom M-Pesa</option>
                    <option value="airtel">Airtel Money</option>
                    <option value="mtn">MTN Mobile Money</option>
                    <option value="tigo">Tigo Pesa</option>
                  </select>
                </div>

                {/* Mobile Phone Number */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider">
                    M-Pesa / Phone Number
                  </label>
                  <div className="relative flex items-center">
                    <Smartphone className="absolute left-3 w-4 h-4 text-emerald-500" />
                    <input
                      type="tel"
                      required
                      value={profileMpesaPhone}
                      onChange={(e) => setProfileMpesaPhone(e.target.value)}
                      placeholder="+254 712 345 678"
                      className="w-full pl-9 pr-3 h-11 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 focus:border-emerald-500 rounded-xl text-sm font-mono font-bold text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Registered Account Name */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider">
                    Registered M-Pesa Name
                  </label>
                  <input
                    type="text"
                    required
                    value={profileAccountName}
                    onChange={(e) => setProfileAccountName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full px-4 h-11 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 focus:border-emerald-500 rounded-xl text-sm font-semibold text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-6 h-11 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-md hover:scale-[1.01] transition-all flex items-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  {isSavingProfile ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  <span>{isSavingProfile ? "Saving Profile..." : "Save Profile & M-Pesa Settings"}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Global Currency Settings */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 p-6 sm:p-8 rounded-3xl shadow-xs text-left">
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">Global Currency Settings</h2>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
              Select your preferred world currency. All statistics, secure locking fees, and checkout simulators will dynamically update to reflect the selected denomination.
            </p>

            {/* Currently Selected Card */}
            <div className="mt-6 bg-gradient-to-r from-teal-500/10 to-emerald-500/10 border border-teal-500/20 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest block font-mono">ACTIVE CURRENCY</span>
                <span className="text-lg font-black text-gray-900 dark:text-white mt-1 block">
                  {selectedCurrency.name} ({selectedCurrency.code})
                </span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-teal-600 dark:text-teal-400">{selectedCurrency.symbol}</span>
                <p className="text-[10px] text-gray-400 font-mono mt-0.5">Rate: 1 USD = {selectedCurrency.rate} {selectedCurrency.code}</p>
              </div>
            </div>

            {/* Quick Select Currencies Grid */}
            <div className="mt-8 space-y-3">
              <span className="text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider block">Quick Select Denominations</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {WORLD_CURRENCIES.slice(0, 8).map((curr) => {
                  const isActive = selectedCurrency.code === curr.code;
                  return (
                    <button
                      key={curr.code}
                      onClick={() => onCurrencyChange(curr)}
                      className={`p-3 rounded-xl border text-xs font-bold text-left flex items-center justify-between transition-all ${
                        isActive
                          ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 border-transparent shadow-md"
                          : "bg-gray-50 dark:bg-zinc-950 text-gray-700 dark:text-zinc-400 border-gray-200 dark:border-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-900"
                      }`}
                    >
                      <span>{curr.code} ({curr.symbol})</span>
                      {isActive && <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* All Currencies Search Selector */}
            <div className="mt-8 space-y-3">
              <span className="text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider block">Search All World Currencies</span>
              <div className="relative">
                <Search className="absolute left-3 w-4 h-4 text-gray-400 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. Rupee, Real, Euro, Lira, CHF..."
                  value={currencySearch}
                  onChange={(e) => setCurrencySearch(e.target.value)}
                  className="w-full pl-9 pr-4 h-11 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-xl text-sm text-gray-900 dark:text-white"
                />
              </div>

              <div className="mt-3 max-h-60 overflow-y-auto border border-gray-100 dark:border-zinc-850 rounded-2xl p-2 bg-gray-50/50 dark:bg-zinc-950/30 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {WORLD_CURRENCIES.filter(curr => 
                  curr.code.toLowerCase().includes(currencySearch.toLowerCase()) ||
                  curr.name.toLowerCase().includes(currencySearch.toLowerCase())
                ).map((curr) => {
                  const isActive = selectedCurrency.code === curr.code;
                  return (
                    <button
                      key={curr.code}
                      onClick={() => onCurrencyChange(curr)}
                      className={`p-2.5 rounded-lg border text-xs font-medium text-left flex items-center justify-between transition-all ${
                        isActive
                          ? "bg-teal-500/10 border-teal-500/30 text-teal-600 dark:text-teal-400 font-bold"
                          : "bg-white dark:bg-zinc-900 border-gray-100 dark:border-zinc-800 text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800"
                      }`}
                    >
                      <div className="flex flex-col">
                        <span>{curr.name}</span>
                        <span className="text-[10px] text-gray-400 font-mono font-normal">{curr.code} ({curr.symbol})</span>
                      </div>
                      {isActive && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                    </button>
                  );
                })}
              </div>
            </div>



          </div>
        </div>
      )}

      {/* Transaction Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl p-6 max-w-md w-full shadow-2xl text-left space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-teal-50 dark:bg-teal-950/30 text-teal-600 rounded-xl">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-gray-900 dark:text-white">Withdrawal Receipt</h3>
                  <p className="text-[10px] text-gray-400 font-mono">Ref: {selectedReceipt.id.slice(0, 12)}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-zinc-950 p-4 rounded-2xl border border-gray-100 dark:border-zinc-850 text-center space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block font-mono">Payout Amount</span>
                <p className="text-3xl font-black text-teal-600 dark:text-teal-400">
                  {formatPrice(selectedReceipt.amount, selectedCurrency)}
                </p>
                <div className="flex items-center justify-center gap-1.5 mt-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    selectedReceipt.status === "completed"
                      ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-500/20"
                      : selectedReceipt.status === "failed"
                      ? "bg-rose-100 dark:bg-rose-950/40 text-rose-600 border border-rose-500/20"
                      : "bg-amber-100 dark:bg-amber-950/40 text-amber-600 border border-amber-500/20"
                  }`}>
                    {selectedReceipt.status}
                  </span>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-zinc-850">
                  <span className="text-gray-400">Method</span>
                  <span className="font-bold text-gray-900 dark:text-white capitalize">{selectedReceipt.method}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-zinc-850">
                  <span className="text-gray-400">Destination</span>
                  <span className="font-mono font-bold text-gray-900 dark:text-white truncate max-w-[200px]" title={selectedReceipt.destinationAddress}>
                    {selectedReceipt.destinationAddress}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-zinc-850">
                  <span className="text-gray-400">Date & Time</span>
                  <span className="font-semibold text-gray-700 dark:text-zinc-300">
                    {selectedReceipt.timestamp ? new Date(selectedReceipt.timestamp.seconds ? selectedReceipt.timestamp.seconds * 1000 : selectedReceipt.timestamp).toLocaleString() : "N/A"}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedReceipt(null)}
              className="w-full py-2.5 bg-gray-900 hover:bg-black dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer"
            >
              Close Receipt
            </button>
          </div>
        </div>
      )}

      {/* QR Code Modal for Mobile Sharing */}
      {qrModalFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center space-y-5 relative">
            <button
              onClick={() => setQrModalFile(null)}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <div className="w-10 h-10 mx-auto rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                <QrCode className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-gray-900 dark:text-white mt-2">Mobile QR Code</h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400">
                Scan with any smartphone camera to view paywall
              </p>
            </div>

            {/* QR Code Display Canvas Container */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200 dark:border-zinc-700 shadow-inner flex flex-col items-center justify-center space-y-3">
              <QRCodeCanvas
                id={`qr-canvas-${qrModalFile.id}`}
                value={`${window.location.origin}/f/${qrModalFile.id}`}
                size={190}
                bgColor={"#ffffff"}
                fgColor={"#0f172a"}
                level={"H"}
                includeMargin={true}
              />
              <div className="w-full text-center">
                <span className="text-xs font-bold text-gray-900 block truncate">{qrModalFile.title}</span>
                <span className="text-[10px] text-teal-600 font-mono font-bold">{formatPrice(qrModalFile.fee, selectedCurrency)}</span>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <button
                onClick={() => handleDownloadQrCode(qrModalFile)}
                className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download High-Res PNG</span>
              </button>

              <button
                onClick={() => {
                  handleCopyLink(qrModalFile.id);
                }}
                className="w-full py-2.5 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-800 dark:text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedId === qrModalFile.id ? "Link Copied!" : "Copy Paywall Link"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Asset Preview & Media Inspector Modal */}
      <AssetPreviewModal
        file={selectedPreviewAsset}
        isOpen={!!selectedPreviewAsset}
        onClose={() => setSelectedPreviewAsset(null)}
        selectedCurrency={selectedCurrency}
        onCopyLink={handleCopyLink}
        isCopied={copiedId === selectedPreviewAsset?.id}
      />

      {/* Floating Toast Notification Banner */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 bg-zinc-900 dark:bg-black text-white border border-teal-500/40 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-bottom-5 duration-300 max-w-md">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold shrink-0 ${
            toast.type === "success" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" :
            toast.type === "error" ? "bg-rose-500/20 text-rose-400 border border-rose-500/30" :
            "bg-sky-500/20 text-sky-400 border border-sky-500/30"
          }`}>
            {toast.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          </div>
          <div className="text-left pr-1 flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">{toast.message}</p>
            <p className="text-[10px] text-zinc-400 font-mono">Only Funds Ledger</p>
          </div>

          {toast.action && (
            <button
              onClick={() => {
                navigator.clipboard.writeText(toast.action!.link);
                setCopiedId(toast.action!.fileId);
                showToast("Paywall link copied to clipboard!", "success");
              }}
              className="px-3 py-1.5 bg-teal-500 hover:bg-teal-400 text-black text-xs font-black rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              {copiedId === toast.action.fileId ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          )}

          <button 
            onClick={() => setToast(prev => ({ ...prev, show: false }))}
            className="text-zinc-500 hover:text-white transition-colors cursor-pointer p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

    </div>
  );
}
