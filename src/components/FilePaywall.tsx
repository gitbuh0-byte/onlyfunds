import React, { useState, useEffect } from "react";
import { 
  Lock, Unlock, DollarSign, ArrowLeft, Download, ShieldCheck, Mail, CreditCard, 
  Sparkles, CheckCircle, AlertCircle, RefreshCw, Send, Eye, MessageSquare, Star, 
  Twitter, Instagram, Youtube, Linkedin, Github, FileText, Video, Image, FileCode,
  Copy, Check, X, Smartphone
} from "lucide-react";
import { SharedFile, FileContent } from "../types";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { User } from "firebase/auth";
import { Currency, formatPrice } from "../lib/currencies";
import FilePreviewCard from "./FilePreviewCard";

interface FilePaywallProps {
  fileId: string;
  user: User | null;
  onNavigateHome: () => void;
  allFiles: SharedFile[];
  selectedCurrency: Currency;
}

export default function FilePaywall({ fileId, user, onNavigateHome, allFiles, selectedCurrency }: FilePaywallProps) {
  const [file, setFile] = useState<SharedFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [unlocked, setUnlocked] = useState(false);
  const [lockedContent, setLockedContent] = useState<FileContent | null>(null);
  
  // Checkout & simulated payment states
  const [buyerEmail, setBuyerEmail] = useState("");
  const [isPaying, setIsPaying] = useState(false);
  const [paymentStep, setPaymentStep] = useState(0); // 0: input, 1: processing, 2: success
  const [paymentMethod, setPaymentMethod] = useState<"mpesa" | "card" | "gpay">("mpesa");
  
  // M-Pesa payment states
  const [mpesaBuyerPhone, setMpesaBuyerPhone] = useState("+254 712 345 678");
  const [creatorMpesaPhone, setCreatorMpesaPhone] = useState<string>("+254 712 345 678");
  const [mpesaTxRef, setMpesaTxRef] = useState<string>("");
  const [processingMsg, setProcessingMsg] = useState<string>("");
  
  // Card form states
  const [cardNumber, setCardNumber] = useState("4111 2222 3333 4444");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvc, setCardCvc] = useState("321");

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Review states
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviews, setReviews] = useState<{name: string, rating: number, text: string}[]>([
    { name: "Satoshi_N", rating: 5, text: "Absolutely incredible value. Instant unlock worked flawlessly." },
    { name: "DevDan", rating: 5, text: "High quality zip file. Saved me 40 hours of work." }
  ]);

  // Selected Unblurred Teaser Modal state
  const [selectedTeaserModal, setSelectedTeaserModal] = useState<any | null>(null);

  const handleCopyPaywallLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    setToastMessage("Paywall link copied to clipboard!");
    setTimeout(() => {
      setIsCopied(false);
      setToastMessage(null);
    }, 3000);
  };

  // Load public file metadata & creator M-Pesa info
  useEffect(() => {
    const loadFileMetadata = async () => {
      setLoading(true);
      
      const processCreatorMpesa = async (cId: string) => {
        try {
          const userSnap = await getDoc(doc(db, "users", cId));
          if (userSnap.exists() && userSnap.data().mpesaPhoneNumber) {
            setCreatorMpesaPhone(userSnap.data().mpesaPhoneNumber);
          }
        } catch (err) {
          console.warn("Could not load creator profile info:", err);
        }
      };

      // 1. Try local list first
      const localFile = allFiles.find(f => f.id === fileId);
      if (localFile) {
        setFile(localFile);
        if (localFile.creatorMpesaPhone) {
          setCreatorMpesaPhone(localFile.creatorMpesaPhone);
        } else {
          await processCreatorMpesa(localFile.creatorId);
        }
        
        // Check if current user is the creator
        if (user && localFile.creatorId === user.uid) {
          setUnlocked(true);
          await loadLockedContent(localFile.id);
        } else {
          // Check if already purchased
          const userEmail = user?.email || buyerEmail;
          if (userEmail) {
            await checkPurchaseReceipt(localFile.id, userEmail);
          }
        }
        setLoading(false);
        return;
      }

      // 2. Fallback to direct Firestore load
      try {
        const fileRef = doc(db, "files", fileId);
        const fileSnap = await getDoc(fileRef);
        if (fileSnap.exists()) {
          const data = fileSnap.data() as SharedFile;
          setFile({ ...data, id: fileSnap.id });
          await processCreatorMpesa(data.creatorId);
          
          // Check if current user is creator
          if (user && data.creatorId === user.uid) {
            setUnlocked(true);
            await loadLockedContent(fileSnap.id);
          } else {
            const userEmail = user?.email || buyerEmail;
            if (userEmail) {
              await checkPurchaseReceipt(fileSnap.id, userEmail);
            }
          }
        }
      } catch (err) {
        console.error("Error loading file metadata:", err);
      } finally {
        setLoading(false);
      }
    };

    loadFileMetadata();
  }, [fileId, user]);

  // Check if a purchase receipt exists
  const checkPurchaseReceipt = async (fId: string, email: string) => {
    try {
      const receiptId = `${email.trim().toLowerCase()}_${fId}`;
      const purchaseRef = doc(db, "purchases", receiptId);
      const purchaseSnap = await getDoc(purchaseRef);
      if (purchaseSnap.exists()) {
        const pData = purchaseSnap.data();
        if (pData.mpesaTxRef) setMpesaTxRef(pData.mpesaTxRef);
        setUnlocked(true);
        await loadLockedContent(fId);
      }
    } catch (err) {
      console.warn("Could not check receipt, sandbox mode fallback available:", err);
    }
  };

  // Load private file contents (revealed after payment verification or creator access)
  const loadLockedContent = async (fId: string) => {
    try {
      const contentRef = doc(db, "files", fId, "private", "content");
      const contentSnap = await getDoc(contentRef);
      if (contentSnap.exists()) {
        setLockedContent(contentSnap.data() as FileContent);
      } else {
        // Safe fallback for seeded items
        setLockedContent({
          fileData: "data:text/plain;base64,U0VFRV9GSUxFX0NPTlRFTlRfT05MWV9GVU5EU19TQU5EQk9Y",
          writtenInfo: "Thank you for unlocking this premium asset! Download the file package using the button below. Code key: OF-SECRET-2026"
        });
      }
    } catch (err) {
      console.error("Firestore read of locked subdocument failed:", err);
      // Safe mock content for pre-seeded items
      setLockedContent({
        fileData: "data:text/plain;base64,U0VFRV9GSUxFX0NPTlRFTlRfT05MWV9GVU5EU19TQU5EQk9Y",
        writtenInfo: "Thank you for unlocking this premium asset! Download the file package using the button below. Code key: OF-SECRET-2026"
      });
    }
  };

  // Trigger base64 file download
  const handleDownload = () => {
    if (!lockedContent || !file) return;
    try {
      const link = document.createElement("a");
      link.href = lockedContent.fileData;
      link.download = file.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Failed downloading file payload:", err);
      alert("Unable to trigger dynamic download. Content payload is corrupted or empty.");
    }
  };

  const platformFee = file ? Math.round(file.fee * 0.05 * 100) / 100 : 0;
  const netCreatorEarnings = file ? Math.round(file.fee * 0.95 * 100) / 100 : 0;

  const handleSimulatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerEmail || !file) return;

    setIsPaying(true);
    setPaymentStep(1);

    const generatedTxRef = `MPESA-STK-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    setMpesaTxRef(generatedTxRef);

    // Dynamic processing step simulator
    const steps = paymentMethod === "mpesa" ? [
      "Connecting to Safaricom M-Pesa Express API...",
      `📱 Sending STK Push prompt to ${mpesaBuyerPhone}...`,
      "Waiting for 4-digit M-Pesa SIM PIN entry...",
      `Deducting 5% Platform Fee (${formatPrice(platformFee, selectedCurrency)}) & Transferring 95% (${formatPrice(netCreatorEarnings, selectedCurrency)}) to ${file.creatorName}'s M-Pesa...`,
      "Payment Confirmed! Decrypting asset keys..."
    ] : [
      "Contacting Escrow Payment Gateway...",
      "Validating sandbox card security...",
      `Deducting 5% Platform Fee & Transferring 95% (${formatPrice(netCreatorEarnings, selectedCurrency)}) to creator...`,
      "Success! Generating unlock keys..."
    ];

    for (let i = 0; i < steps.length; i++) {
      setProcessingMsg(steps[i]);
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    try {
      // 1. Create Purchase Receipt in Firestore
      const receiptId = `${buyerEmail.trim().toLowerCase()}_${file.id}`;
      const purchaseRef = doc(db, "purchases", receiptId);
      
      const newPurchase = {
        id: receiptId,
        fileId: file.id,
        fileTitle: file.title,
        buyerEmail: buyerEmail.trim().toLowerCase(),
        amountPaid: file.fee,
        platformFee: platformFee,
        netCreatorEarnings: netCreatorEarnings,
        paymentMethod: paymentMethod,
        mpesaBuyerPhone: paymentMethod === "mpesa" ? mpesaBuyerPhone : undefined,
        mpesaTxRef: generatedTxRef,
        purchasedAt: new Date(),
        creatorId: file.creatorId
      };
      
      await setDoc(purchaseRef, newPurchase);

      // 2. Update File counters & earnings in Firestore
      try {
        const fileRef = doc(db, "files", file.id);
        const fileSnap = await getDoc(fileRef);
        if (fileSnap.exists()) {
          const currentData = fileSnap.data();
          await setDoc(fileRef, {
            ...currentData,
            purchasesCount: (currentData.purchasesCount || 0) + 1,
            totalEarnings: (currentData.totalEarnings || 0) + netCreatorEarnings
          }, { merge: true });
        }
      } catch (err) {
        console.warn("Could not increment sales tracker in DB, local update used.", err);
      }

      setUnlocked(true);
      await loadLockedContent(file.id);
      setPaymentStep(2);
    } catch (error) {
      console.error("Payment registration failed:", error);
      // fallback in case of write restrictions or offline
      setUnlocked(true);
      setLockedContent({
        fileData: "data:text/plain;base64,U0VFRV9GSUxFX0NPTlRFTlRfT05MWV9GVU5EU19TQU5EQk9Y",
        writtenInfo: "Sandbox bypass: Transaction processed locally! Code key: OF-SECRET-2026"
      });
      setPaymentStep(2);
    } finally {
      setIsPaying(false);
    }
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment) return;
    setReviews([{ name: buyerEmail.split("@")[0] || "Anonymous", rating, text: comment }, ...reviews]);
    setComment("");
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "twitter": return <Twitter className="w-4 h-4" />;
      case "instagram": return <Instagram className="w-4 h-4" />;
      case "youtube": return <Youtube className="w-4 h-4" />;
      case "linkedin": return <Linkedin className="w-4 h-4" />;
      case "github": return <Github className="w-4 h-4" />;
      default: return <Eye className="w-4 h-4" />;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "twitter": return "bg-sky-500 hover:bg-sky-600 text-white";
      case "instagram": return "bg-pink-600 hover:bg-pink-700 text-white";
      case "youtube": return "bg-rose-600 hover:bg-rose-700 text-white";
      case "linkedin": return "bg-blue-700 hover:bg-blue-800 text-white";
      case "github": return "bg-zinc-800 hover:bg-zinc-900 text-white";
      default: return "bg-teal-600 text-white";
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8">
        <RefreshCw className="w-10 h-10 text-teal-600 dark:text-teal-400 animate-spin mb-4" />
        <p className="text-sm text-gray-500 dark:text-zinc-400 font-medium">Securing escrow connection...</p>
      </div>
    );
  }

  if (!file) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Paywall Not Found</h3>
        <p className="text-sm text-gray-500 dark:text-zinc-400 mt-2">
          This secure link may have expired or was disabled by the creator. Check the URL and try again.
        </p>
        <button
          onClick={onNavigateHome}
          className="mt-6 px-5 py-2.5 bg-zinc-900 text-white rounded-xl text-sm font-semibold"
        >
          Return to Hub
        </button>
      </div>
    );
  }

  return (
    <div id="paywall-screen" className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      
      {/* Back navigation & Share link */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <button
          onClick={onNavigateHome}
          className="flex items-center space-x-1.5 text-sm font-bold text-gray-500 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Marketplace</span>
        </button>

        <button
          onClick={handleCopyPaywallLink}
          className="flex items-center space-x-2 px-3.5 py-2 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/60 border border-teal-500/30 rounded-xl text-xs font-bold transition-all shadow-xs"
        >
          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{isCopied ? "Link Copied!" : "Copy Paywall Link"}</span>
        </button>
      </div>

      {/* Floating Success Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 bg-zinc-900 dark:bg-black text-white border border-teal-500/40 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 font-bold">
            <CheckCircle className="w-4 h-4" />
          </div>
          <div className="text-left pr-2">
            <p className="text-xs font-bold text-white">{toastMessage}</p>
            <p className="text-[10px] text-zinc-400 font-mono">Paywall Link Secured</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Product Showcase & Creator Profile */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* File Watermarked / Blurred Preview Component */}
          <FilePreviewCard
            file={file}
            unlocked={unlocked}
            selectedCurrency={selectedCurrency}
            onUnlockRequest={() => {
              document.getElementById("locked-paywall-card")?.scrollIntoView({ behavior: "smooth" });
            }}
            downloadUrl={lockedContent?.fileData}
          />

          <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
            
            {/* Public Details */}
            <div className="p-6 text-left">
              <h1 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white leading-tight mb-4">
                {file.title}
              </h1>
              <h3 className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">Asset Description</h3>
              <p className="text-sm text-gray-600 dark:text-zinc-300 mt-2.5 leading-relaxed whitespace-pre-line">
                {file.description}
              </p>

              {/* Bundle Teaser Items (Unblurred vs Blurred) */}
              <div className="mt-6 pt-6 border-t border-gray-100 dark:border-zinc-800">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-extrabold text-gray-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-teal-500" />
                    <span>Bundle Content & Teaser Previews</span>
                  </h4>
                  <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold bg-teal-50 dark:bg-teal-950/40 border border-teal-500/20 px-2 py-0.5 rounded-full">
                    Up to 2 Unblurred Teasers
                  </span>
                </div>

                <div className="space-y-2">
                  {(file.previewFiles && file.previewFiles.length > 0 ? file.previewFiles : [
                    { id: "pf-1", name: "Sample Teaser Preview 1.pdf", fileType: "document", isUnblurred: true, size: "1.2 MB" },
                    { id: "pf-2", name: "Sample Teaser Preview 2.png", fileType: "image", isUnblurred: true, size: "2.1 MB" },
                    { id: "pf-3", name: "Full Raw Content Package.zip", fileType: "document", isUnblurred: false, size: "14.5 MB" }
                  ]).map((previewItem) => {
                    const isUnblurredTeaser = previewItem.isUnblurred || unlocked;
                    return (
                      <div
                        key={previewItem.id}
                        className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                          isUnblurredTeaser
                            ? "bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-500/30 text-emerald-900 dark:text-emerald-100"
                            : "bg-gray-50/80 dark:bg-zinc-950/50 border-gray-200 dark:border-zinc-800 text-gray-500 dark:text-zinc-400"
                        }`}
                      >
                        <div className="flex items-center space-x-3 truncate">
                          <div className={`p-2 rounded-xl text-white font-bold shrink-0 ${
                            isUnblurredTeaser ? "bg-emerald-600" : "bg-zinc-700"
                          }`}>
                            {previewItem.fileType === "document" && <FileText className="w-4 h-4" />}
                            {previewItem.fileType === "image" && <Image className="w-4 h-4" />}
                            {previewItem.fileType === "video" && <Video className="w-4 h-4" />}
                            {previewItem.fileType === "code" && <FileCode className="w-4 h-4" />}
                            {previewItem.fileType === "other" && <FileCode className="w-4 h-4" />}
                          </div>

                          <div className="truncate text-left">
                            <div className="flex items-center space-x-2">
                              <p className="text-xs font-bold truncate text-gray-900 dark:text-white">
                                {previewItem.name}
                              </p>
                              {isUnblurredTeaser ? (
                                <span className="text-[9px] bg-emerald-600 text-white font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-0.5 shrink-0">
                                  <Eye className="w-2.5 h-2.5" />
                                  Unblurred
                                </span>
                              ) : (
                                <span className="text-[9px] bg-zinc-800 text-zinc-300 font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-0.5 shrink-0">
                                  <Lock className="w-2.5 h-2.5" />
                                  Blurred
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-gray-500 dark:text-zinc-400 font-mono mt-0.5">
                              {previewItem.size || "File Asset"} • {isUnblurredTeaser ? "Free Public Teaser Sample" : "Locked behind paywall"}
                            </p>
                          </div>
                        </div>

                        <div className="shrink-0">
                          {isUnblurredTeaser ? (
                            <button
                              type="button"
                              onClick={() => setSelectedTeaserModal(previewItem)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center space-x-1 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View Teaser</span>
                            </button>
                          ) : (
                            <div className="px-3 py-1.5 bg-gray-200/80 dark:bg-zinc-800/80 text-gray-400 dark:text-zinc-500 text-xs font-bold rounded-xl flex items-center space-x-1 select-none">
                              <Lock className="w-3.5 h-3.5" />
                              <span>Locked</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Creator details and handles */}
              <div className="mt-8 pt-6 border-t border-gray-100 dark:border-zinc-800/80">
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <p className="text-[10px] text-gray-400 dark:text-zinc-500 uppercase font-bold tracking-wider">Verifying Creator</p>
                    <p className="text-sm font-extrabold text-gray-900 dark:text-white mt-1">{file.creatorName}</p>
                    <p className="text-xs text-gray-500 dark:text-zinc-400">{file.creatorEmail}</p>
                  </div>

                  {/* Social Handles with Icons */}
                  {file.socialLinks && file.socialLinks.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 max-w-[50%] justify-end">
                      {file.socialLinks.map((link) => (
                        <a
                          key={link.platform}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`p-2 rounded-xl text-xs font-bold transition-transform hover:scale-105 ${getPlatformColor(link.platform)}`}
                          title={`Creator on ${link.platform}`}
                        >
                          {getPlatformIcon(link.platform)}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Secure Trust Banner */}
          <div className="bg-emerald-500/5 border border-emerald-500/10 dark:border-emerald-500/5 p-4 rounded-2xl flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-left">
              <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">Only Funds Buyer Shield Protection</p>
              <p className="text-[11px] text-emerald-600/90 dark:text-emerald-400/80 mt-1 leading-normal">
                Your sandbox fee is protected in escrow. Unlock with absolute safety. If the file is corrupted or fails rules validation, your mock balance is immediately returned.
              </p>
            </div>
          </div>

          {/* Community Reviews */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl p-6 text-left">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">Reviews & Feedback</h3>
            
            <div className="space-y-4 max-h-56 overflow-y-auto pr-2">
              {reviews.map((r, idx) => (
                <div key={idx} className="border-b border-gray-50 dark:border-zinc-800 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-700 dark:text-zinc-300">{r.name}</span>
                    <div className="flex text-amber-500">
                      {Array.from({ length: r.rating }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1 leading-relaxed">{r.text}</p>
                </div>
              ))}
            </div>

            {unlocked && (
              <form onSubmit={handleAddReview} className="mt-4 pt-4 border-t border-gray-100 dark:border-zinc-800/85 space-y-3">
                <p className="text-xs font-bold text-gray-800 dark:text-zinc-200">Leave a review for this asset</p>
                
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-gray-500">Rating:</span>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className={`text-lg transition-colors ${rating >= star ? "text-amber-400" : "text-gray-300"}`}
                    >
                      ★
                    </button>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Instant help! File was perfectly formatted."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="flex-1 px-3 py-2 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs transition-colors"
                  >
                    Post
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Right Side: LOCK SCREEN / PAYWALL / DOWNLOADS */}
        <div className="lg:col-span-5 sticky top-24">
          
          {!unlocked ? (
            /* locked paywall view */
            <div id="locked-paywall-card" className="bg-white dark:bg-zinc-900 border-2 border-gray-150 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-md text-center space-y-6">
              
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-950/30 flex items-center justify-center text-teal-600 dark:text-teal-400 mb-4 animate-bounce">
                  <Lock className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">Premium Content Encrypted</h2>
                <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1 max-w-xs mx-auto">
                  Monetization fee set by <b>{file.creatorName}</b>. Complete sandbox checkout to unlock download keys immediately.
                </p>
              </div>

              {/* Price / Security Fee */}
              <div className="bg-gray-50 dark:bg-zinc-950 rounded-2xl p-4 border border-gray-150 dark:border-zinc-850">
                <span className="text-xs text-gray-500 dark:text-zinc-500 uppercase tracking-widest font-mono">Unlock Fee</span>
                <p className="text-3xl font-black text-gray-900 dark:text-white mt-1">
                  {formatPrice(file.fee, selectedCurrency)}
                </p>
              </div>

              {/* Blurred Secured Assets Preview block */}
              <div className="text-left space-y-2">
                <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider block">
                  Escrow Asset Package (Locked Preview)
                </span>
                <div className="relative border border-dashed border-gray-200 dark:border-zinc-800 rounded-2xl p-4 bg-gray-50/50 dark:bg-zinc-950/50 overflow-hidden">
                  
                  {/* Blurred mock contents */}
                  <div className="filter blur-md select-none pointer-events-none space-y-4">
                    {/* Mock Secured Text Instruction */}
                    <div className="bg-zinc-200/50 dark:bg-zinc-900/50 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 font-mono text-[9px] text-zinc-500 space-y-1">
                      <p>SECURITY ESCROW PROTOCOL DEPLOYED...</p>
                      <p>SENDER: {file.creatorEmail}</p>
                      <p>HASH VALUE: E8B47C90FA3E8B47C90F...</p>
                    </div>
                    
                    {/* Mock File Download Bar */}
                    <div className="w-full py-2.5 bg-zinc-200 dark:bg-zinc-800/80 text-zinc-400 rounded-xl text-xs flex items-center justify-center space-x-2">
                      <Download className="w-4 h-4" />
                      <span>Download {file.fileName}</span>
                    </div>
                  </div>
                  
                  {/* Absolute Lock Overlay */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/20 dark:bg-zinc-950/20 backdrop-blur-[2px]">
                    <div className="w-9 h-9 rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center shadow-md mb-1.5">
                      <Lock className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-extrabold text-zinc-950 dark:text-white uppercase tracking-wider">Locked Asset</span>
                    <span className="text-[9px] text-zinc-500 dark:text-zinc-400 font-mono mt-0.5">{file.fileName}</span>
                  </div>
                </div>
              </div>

              {/* Checkout form step controller */}
              {paymentStep === 0 && (
                <form id="checkout-form" onSubmit={handleSimulatePayment} className="space-y-4 text-left">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider">
                      Your Active Email Address
                    </label>
                    <div className="relative flex items-center">
                      <Mail className="absolute left-3 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        required
                        id="buyer-email-input"
                        placeholder="buyer@example.com"
                        value={buyerEmail}
                        onChange={(e) => setBuyerEmail(e.target.value)}
                        className="w-full pl-9 pr-4 h-11 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 focus:border-teal-500 rounded-xl text-sm"
                      />
                    </div>
                  </div>

                  {/* Payment method selector */}
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("mpesa")}
                      className={`flex-1 flex items-center justify-center space-x-1.5 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                        paymentMethod === "mpesa"
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-xs"
                          : "border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800"
                      }`}
                    >
                      <Smartphone className="w-4 h-4 text-emerald-500" />
                      <span>M-Pesa Express</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("card")}
                      className={`flex-1 flex items-center justify-center space-x-1.5 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                        paymentMethod === "card"
                          ? "border-teal-500 bg-teal-50/10 text-teal-600 dark:text-teal-400"
                          : "border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800"
                      }`}
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Card</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("gpay")}
                      className={`flex-1 flex items-center justify-center space-x-1.5 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                        paymentMethod === "gpay"
                          ? "border-teal-500 bg-teal-50/10 text-teal-600 dark:text-teal-400"
                          : "border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800"
                      }`}
                    >
                      <span> / GPay</span>
                    </button>
                  </div>

                  {/* Dynamic Fee Breakdown Box (5% Platform Fee & 95% Creator M-Pesa Payout) */}
                  <div className="bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/20 rounded-2xl p-3.5 text-xs space-y-2">
                    <div className="flex justify-between items-center text-gray-600 dark:text-zinc-400">
                      <span>Link Unlock Price</span>
                      <span className="font-bold font-mono text-gray-900 dark:text-white">{formatPrice(file.fee, selectedCurrency)}</span>
                    </div>
                    <div className="flex justify-between items-center text-gray-500 dark:text-zinc-400 text-[11px]">
                      <span className="flex items-center gap-1">
                        <span>Platform Escrow Fee (5%)</span>
                      </span>
                      <span className="font-mono text-rose-500 font-bold">-{formatPrice(platformFee, selectedCurrency)}</span>
                    </div>
                    <div className="pt-2 border-t border-emerald-500/20 flex justify-between items-center font-bold text-emerald-700 dark:text-emerald-300">
                      <span className="flex items-center gap-1 text-[11px]">
                        <Smartphone className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Net Direct M-Pesa Payout to Creator (95%)</span>
                      </span>
                      <span className="font-mono text-sm font-extrabold">{formatPrice(netCreatorEarnings, selectedCurrency)}</span>
                    </div>
                  </div>

                  {paymentMethod === "mpesa" ? (
                    <div className="space-y-3 bg-emerald-500/5 dark:bg-zinc-950/60 p-4 rounded-2xl border border-emerald-500/20">
                      <div className="space-y-1">
                        <label className="block text-[10px] uppercase font-bold text-gray-600 dark:text-zinc-400 tracking-wider">
                          Your M-Pesa Phone Number (For STK Push)
                        </label>
                        <div className="relative flex items-center">
                          <Smartphone className="absolute left-3 w-4 h-4 text-emerald-600" />
                          <input
                            type="tel"
                            required
                            placeholder="e.g. +254 712 345 678"
                            value={mpesaBuyerPhone}
                            onChange={(e) => setMpesaBuyerPhone(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:border-emerald-500 rounded-xl text-xs font-mono font-bold text-gray-900 dark:text-white"
                          />
                        </div>
                      </div>
                      <div className="text-[10px] text-gray-500 dark:text-zinc-400 leading-tight bg-white dark:bg-zinc-900/50 p-2.5 rounded-xl border border-gray-100 dark:border-zinc-800 space-y-1">
                        <p className="font-bold text-emerald-600 dark:text-emerald-400">⚡ Instant Automated Settlement:</p>
                        <p>Upon PIN authorization, <b>95% ({formatPrice(netCreatorEarnings, selectedCurrency)})</b> lands straight into <b>{file.creatorName}</b>'s M-Pesa ({creatorMpesaPhone}).</p>
                      </div>
                    </div>
                  ) : paymentMethod === "card" ? (
                    <div className="space-y-3 bg-gray-50/50 dark:bg-zinc-950/50 p-4 rounded-xl border border-gray-100 dark:border-zinc-800">
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold text-gray-400">Card Number</span>
                        <input
                          type="text"
                          required
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className="w-full bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-850 px-2 py-1.5 rounded-lg text-xs font-mono"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase font-bold text-gray-400">Expiry</span>
                          <input
                            type="text"
                            required
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            className="w-full bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-850 px-2 py-1.5 rounded-lg text-xs font-mono"
                          />
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase font-bold text-gray-400">CVC</span>
                          <input
                            type="text"
                            required
                            value={cardCvc}
                            onChange={(e) => setCardCvc(e.target.value)}
                            className="w-full bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-850 px-2 py-1.5 rounded-lg text-xs font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-zinc-950 dark:bg-black rounded-xl text-center border border-zinc-800">
                      <p className="text-[10px] text-zinc-400">One-tap express wallet simulated checkout activated</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    id="checkout-pay-btn"
                    className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md hover:scale-[1.01] transition-all flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    {paymentMethod === "mpesa" ? <Smartphone className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                    <span>
                      {paymentMethod === "mpesa" 
                        ? `Pay ${formatPrice(file.fee, selectedCurrency)} via M-Pesa Express`
                        : `Pay ${formatPrice(file.fee, selectedCurrency)} Fee`
                      }
                    </span>
                  </button>
                </form>
              )}

              {paymentStep === 1 && (
                <div id="checkout-loading-screen" className="py-8 space-y-4 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto animate-bounce">
                    <Smartphone className="w-6 h-6 animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-extrabold text-gray-900 dark:text-white">Processing Payment...</p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-mono font-medium px-4">{processingMsg}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-center gap-1 text-[10px] text-gray-400">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-500" />
                <span>SSL Encrypted • 95% Instant M-Pesa Direct Settlement</span>
              </div>
            </div>
          ) : (
            /* unlocked state: display credentials + download button */
            <div id="unlocked-content-card" className="bg-gradient-to-b from-white to-gray-50 dark:from-zinc-900 dark:to-zinc-950 border-2 border-emerald-500/50 rounded-3xl p-6 sm:p-8 shadow-lg text-center space-y-6">
              
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4 shadow-sm">
                  <Unlock className="w-8 h-8 animate-pulse" />
                </div>
                <span className="bg-emerald-100 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 font-bold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Payment Verified & Decrypted
                </span>
                <h2 className="text-xl font-black text-gray-900 dark:text-white mt-3">Keys Unlocked</h2>
                <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1 max-w-xs mx-auto">
                  Escrow verified. The creator's assets are available below.
                </p>
              </div>

              {/* M-Pesa Settlement Summary Badge */}
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 text-left space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest font-mono">M-PESA SETTLEMENT RECEIPT</span>
                  <span className="text-[10px] bg-emerald-600 text-white font-mono px-2 py-0.5 rounded font-bold">{mpesaTxRef || "MPESA-CONFIRMED"}</span>
                </div>
                <div className="text-xs space-y-1 font-mono text-gray-700 dark:text-zinc-300">
                  <div className="flex justify-between">
                    <span>Total Amount Charged:</span>
                    <span className="font-bold">{formatPrice(file.fee, selectedCurrency)}</span>
                  </div>
                  <div className="flex justify-between text-rose-500">
                    <span>Platform Fee (5%):</span>
                    <span>-{formatPrice(platformFee, selectedCurrency)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold border-t border-emerald-500/20 pt-1">
                    <span>Land into Creator M-Pesa (95%):</span>
                    <span>{formatPrice(netCreatorEarnings, selectedCurrency)}</span>
                  </div>
                </div>
                <p className="text-[10px] text-gray-500 dark:text-zinc-400">
                  Recipient: <b>{file.creatorName}</b> ({creatorMpesaPhone})
                </p>
              </div>

              {/* Private instructions block */}
              {lockedContent?.writtenInfo && (
                <div className="text-left bg-zinc-900 dark:bg-black rounded-2xl p-5 border border-zinc-800 font-mono relative overflow-hidden shadow-inner">
                  <div className="absolute top-0 right-0 bg-emerald-500 text-zinc-950 font-bold text-[8px] px-2.5 py-0.5 rounded-bl-lg uppercase tracking-wider">
                    Secured Message
                  </div>
                  <p className="text-xs text-emerald-400 leading-relaxed whitespace-pre-line">
                    {lockedContent.writtenInfo}
                  </p>
                </div>
              )}

              {/* Large glistining Download Button */}
              {lockedContent?.fileData ? (
                <button
                  onClick={handleDownload}
                  id="unlocked-download-btn"
                  className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-2xl text-sm shadow-xl shadow-teal-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-2.5 cursor-pointer animate-pulse"
                >
                  <Download className="w-5 h-5" />
                  <div className="text-left">
                    <p className="font-bold">Download Premium File</p>
                    <p className="text-[9px] text-teal-200 font-mono font-normal">
                      {file.fileName}
                    </p>
                  </div>
                </button>
              ) : (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900/30 rounded-xl text-yellow-800 dark:text-yellow-300 text-xs">
                  This shared link contains written credentials only. No download file package was attached.
                </div>
              )}

              <div className="flex items-center justify-center space-x-1.5 text-xs text-teal-600 dark:text-teal-400 font-medium">
                <CheckCircle className="w-4 h-4" />
                <span>Only Funds Escrow Complete</span>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Unblurred Teaser Modal */}
      {selectedTeaserModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative text-left animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setSelectedTeaserModal(null)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2.5 bg-emerald-500 text-white rounded-xl">
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider">
                  Unblurred Public Teaser Sample
                </span>
                <h3 className="text-base font-bold text-gray-900 dark:text-white mt-1">
                  {selectedTeaserModal.name}
                </h3>
              </div>
            </div>

            <div className="bg-zinc-950 text-emerald-400 font-mono text-xs p-4 rounded-2xl border border-zinc-800 max-h-60 overflow-y-auto whitespace-pre-wrap leading-relaxed shadow-inner">
              <p className="text-zinc-400 text-[11px] mb-2">// Sample Unblurred Free Preview Content:</p>
              <p className="text-emerald-300">
                {selectedTeaserModal.name} - Free Unblurred Sample
              </p>
              <p className="mt-2 text-zinc-300">
                This item was set as an UNBLURRED TEASER preview by the creator ({file.creatorName}). You can inspect this sample freely before choosing to unlock the complete bundle for {formatPrice(file.fee, selectedCurrency)}.
              </p>
              <p className="mt-3 text-emerald-500 font-bold">
                ✓ Verified Clean & Original Asset Sample
              </p>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedTeaserModal(null)}
                className="px-5 py-2.5 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-700 transition-colors"
              >
                Close Teaser Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
