import React, { useState, useEffect } from "react";
import { 
  X, ZoomIn, ZoomOut, RotateCcw, Download, ExternalLink, Clipboard, Check, 
  FileText, Video, Image as ImageIcon, FileCode, Music, Archive, Sparkles, 
  DollarSign, Eye, EyeOff, Layers, ShieldCheck, Share2, Maximize2, Minimize2,
  ChevronLeft, ChevronRight, Lock
} from "lucide-react";
import { SharedFile, PreviewFileItem } from "../types";
import { Currency, formatPrice } from "../lib/currencies";

interface AssetPreviewModalProps {
  file: SharedFile | null;
  isOpen: boolean;
  onClose: () => void;
  selectedCurrency: Currency;
  onCopyLink: (fileId: string) => void;
  isCopied: boolean;
}

export const AssetPreviewModal: React.FC<AssetPreviewModalProps> = ({
  file,
  isOpen,
  onClose,
  selectedCurrency,
  onCopyLink,
  isCopied
}) => {
  if (!isOpen || !file) return null;

  // Available preview images (main thumbnail/cover + any preview files)
  const defaultMainImage = file.thumbnailUrl || file.coverUrl || "";
  
  // Collect all available image sources for this file
  const imageGallery: { url: string; label: string; isTeaser?: boolean; type?: string }[] = [];
  if (defaultMainImage) {
    imageGallery.push({ url: defaultMainImage, label: "Main Cover / Thumbnail", isTeaser: false });
  }

  if (file.previewFiles && file.previewFiles.length > 0) {
    file.previewFiles.forEach((p, idx) => {
      if (p.fileData && p.fileData.startsWith("data:image")) {
        imageGallery.push({
          url: p.fileData,
          label: p.fileName || `Preview Teaser #${idx + 1}`,
          isTeaser: true,
          type: p.fileType
        });
      }
    });
  }

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [zoomScale, setZoomScale] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Reset state when file changes
  useEffect(() => {
    setActiveImageIndex(0);
    setZoomScale(1);
    setIsFullscreen(false);
    setImageError(false);
  }, [file?.id]);

  // Keyboard accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowRight" && imageGallery.length > 1) {
        setActiveImageIndex((prev) => (prev + 1) % imageGallery.length);
        setZoomScale(1);
      } else if (e.key === "ArrowLeft" && imageGallery.length > 1) {
        setActiveImageIndex((prev) => (prev - 1 + imageGallery.length) % imageGallery.length);
        setZoomScale(1);
      } else if (e.key === "+" || e.key === "=") {
        setZoomScale((prev) => Math.min(prev + 0.25, 3));
      } else if (e.key === "-") {
        setZoomScale((prev) => Math.max(prev - 0.25, 0.75));
      } else if (e.key === "0") {
        setZoomScale(1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, imageGallery.length]);

  const activeMedia = imageGallery[activeImageIndex] || { url: defaultMainImage, label: file.title };
  const currentImageUrl = activeMedia.url;
  const paywallUrl = `${window.location.origin}?file=${file.id}`;

  const handleZoomIn = () => setZoomScale((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoomScale((prev) => Math.max(prev - 0.25, 0.75));
  const handleResetZoom = () => setZoomScale(1);

  // Download preview thumbnail
  const handleDownloadThumbnail = () => {
    if (!currentImageUrl) return;
    const a = document.createElement("a");
    a.href = currentImageUrl;
    a.download = `${file.title.replace(/[^a-zA-Z0-9]/g, "_")}_preview.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const getCategoryIcon = (type: string) => {
    switch (type) {
      case "video": return <Video className="w-4 h-4 text-purple-500" />;
      case "image": return <ImageIcon className="w-4 h-4 text-teal-500" />;
      case "document": return <FileText className="w-4 h-4 text-blue-500" />;
      case "code": return <FileCode className="w-4 h-4 text-amber-500" />;
      case "audio": return <Music className="w-4 h-4 text-rose-500" />;
      default: return <Archive className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatDate = (date: any) => {
    if (!date) return "Recently";
    try {
      if (date.toDate) return date.toDate().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return "Recently";
    }
  };

  const netEarnings = ((file.totalEarnings || 0) * 0.95);

  return (
    <div 
      id="asset-preview-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        id="asset-preview-modal-container"
        className={`bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 ${
          isFullscreen 
            ? "w-full h-full max-w-none rounded-none" 
            : "w-full max-w-5xl max-h-[90vh]"
        }`}
      >
        {/* Modal Top Header */}
        <div className="px-6 py-4 border-b border-gray-150 dark:border-zinc-800 flex items-center justify-between gap-4 bg-gray-50/70 dark:bg-zinc-950/70 shrink-0">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="p-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-xs shrink-0">
              {getCategoryIcon(file.fileType || "document")}
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-black text-gray-900 dark:text-white truncate">
                  {file.title}
                </h2>
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[11px] font-black rounded-lg font-mono shrink-0">
                  {formatPrice(file.fee, selectedCurrency)}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-zinc-400 font-mono truncate">
                {file.fileName} • Created {formatDate(file.createdAt)}
              </p>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/60 dark:hover:bg-zinc-800 rounded-xl transition-all cursor-pointer hidden sm:flex items-center justify-center"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen View"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              id="asset-preview-modal-close-btn"
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/60 dark:hover:bg-zinc-800 rounded-xl transition-all cursor-pointer"
              title="Close Preview (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Content: Split Viewer & Sidebar */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 min-h-0">
          
          {/* Left: Large Media Stage & Canvas */}
          <div className="lg:col-span-8 bg-zinc-950 flex flex-col justify-between relative min-h-[340px] sm:min-h-[420px] p-4 sm:p-6 overflow-hidden select-none border-b lg:border-b-0 lg:border-r border-zinc-800">
            
            {/* Top Toolbar overlay over media */}
            <div className="flex items-center justify-between z-10 w-full mb-3">
              <div className="flex items-center space-x-1.5 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-white text-xs font-mono">
                <ImageIcon className="w-3.5 h-3.5 text-teal-400" />
                <span className="truncate max-w-[200px]">{activeMedia.label}</span>
                {imageGallery.length > 1 && (
                  <span className="text-zinc-400 text-[10px]">
                    ({activeImageIndex + 1}/{imageGallery.length})
                  </span>
                )}
              </div>

              {/* Zoom & View Controls */}
              <div className="flex items-center space-x-1 bg-black/60 backdrop-blur-md p-1 rounded-xl border border-white/10 text-white">
                <button
                  onClick={handleZoomOut}
                  disabled={zoomScale <= 0.75}
                  className="p-1.5 hover:bg-white/15 rounded-lg disabled:opacity-30 transition-all cursor-pointer"
                  title="Zoom Out (-)"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] font-mono font-bold px-1 min-w-[40px] text-center">
                  {Math.round(zoomScale * 100)}%
                </span>
                <button
                  onClick={handleZoomIn}
                  disabled={zoomScale >= 3}
                  className="p-1.5 hover:bg-white/15 rounded-lg disabled:opacity-30 transition-all cursor-pointer"
                  title="Zoom In (+)"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleResetZoom}
                  className="p-1.5 hover:bg-white/15 rounded-lg transition-all cursor-pointer text-zinc-400 hover:text-white"
                  title="Reset Scale (0)"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Media Image Container Stage */}
            <div className="flex-1 flex items-center justify-center relative overflow-hidden my-auto w-full">
              {currentImageUrl && !imageError ? (
                <div 
                  className="transition-transform duration-200 ease-out flex items-center justify-center max-w-full max-h-full"
                  style={{ transform: `scale(${zoomScale})` }}
                >
                  <img
                    src={currentImageUrl}
                    alt={file.title}
                    onError={() => setImageError(true)}
                    className="max-h-[50vh] lg:max-h-[60vh] max-w-full object-contain rounded-2xl shadow-2xl border border-white/10"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center text-zinc-400 space-y-3 bg-zinc-900/60 rounded-3xl border border-zinc-800 max-w-md">
                  <div className="w-16 h-16 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
                    {getCategoryIcon(file.fileType || "document")}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-zinc-200">No Image Preview Available</h4>
                    <p className="text-xs text-zinc-500 mt-1">
                      This {file.fileType} asset doesn't have a direct image preview thumbnail uploaded.
                    </p>
                  </div>
                </div>
              )}

              {/* Multi-image Gallery Navigation Arrows */}
              {imageGallery.length > 1 && (
                <>
                  <button
                    onClick={() => {
                      setActiveImageIndex((prev) => (prev - 1 + imageGallery.length) % imageGallery.length);
                      setZoomScale(1);
                    }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/60 hover:bg-black/90 text-white rounded-full border border-white/10 backdrop-blur-md transition-all cursor-pointer shadow-lg"
                    title="Previous Image (Left Arrow)"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      setActiveImageIndex((prev) => (prev + 1) % imageGallery.length);
                      setZoomScale(1);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/60 hover:bg-black/90 text-white rounded-full border border-white/10 backdrop-blur-md transition-all cursor-pointer shadow-lg"
                    title="Next Image (Right Arrow)"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Bottom Gallery Thumbnail Strip (If multiple items exist) */}
            {imageGallery.length > 1 && (
              <div className="flex items-center gap-2 pt-3 overflow-x-auto justify-center z-10">
                {imageGallery.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setActiveImageIndex(idx);
                      setZoomScale(1);
                    }}
                    className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 relative ${
                      activeImageIndex === idx 
                        ? "border-teal-400 ring-2 ring-teal-400/30 scale-105" 
                        : "border-zinc-700 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                    {img.isTeaser && (
                      <span className="absolute bottom-0 inset-x-0 bg-teal-600/90 text-[8px] font-bold text-white text-center py-0.5">
                        TEASER
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Asset Metadata, Monetization Metrics & Actions */}
          <div className="lg:col-span-4 p-6 sm:p-8 flex flex-col justify-between space-y-6 bg-white dark:bg-zinc-900 text-left overflow-y-auto">
            
            <div className="space-y-5">
              {/* Paywall Link & Unlock Price Header */}
              <div className="p-4 bg-teal-500/10 border border-teal-500/20 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-teal-700 dark:text-teal-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-teal-500" />
                    <span>Paywall Asset Status</span>
                  </span>
                  <span className="text-xs font-mono font-black text-gray-900 dark:text-white">
                    {formatPrice(file.fee, selectedCurrency)}
                  </span>
                </div>
                <p className="text-[11px] text-gray-600 dark:text-zinc-300 leading-relaxed">
                  Protected with end-to-end access control. Once unlocked by buyers, <b>95%</b> is automatically sent to creator's M-Pesa.
                </p>
              </div>

              {/* Description */}
              {file.description && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                    Asset Description
                  </label>
                  <p className="text-sm text-gray-800 dark:text-zinc-200 leading-relaxed bg-gray-50 dark:bg-zinc-950 p-3.5 rounded-xl border border-gray-150 dark:border-zinc-800">
                    {file.description}
                  </p>
                </div>
              )}

              {/* File Specs & Stats Bento Grid */}
              <div className="grid grid-cols-2 gap-3 text-left">
                <div className="p-3 bg-gray-50 dark:bg-zinc-950 rounded-xl border border-gray-150 dark:border-zinc-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total Unlocks</span>
                  <p className="text-base font-extrabold text-gray-900 dark:text-white mt-0.5">
                    {file.purchasesCount || 0}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-zinc-950 rounded-xl border border-gray-150 dark:border-zinc-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Net Settled</span>
                  <p className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    ${netEarnings.toFixed(2)}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-zinc-950 rounded-xl border border-gray-150 dark:border-zinc-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Category</span>
                  <p className="text-xs font-black text-gray-900 dark:text-white capitalize mt-1">
                    {file.fileType || "Document"}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-zinc-950 rounded-xl border border-gray-150 dark:border-zinc-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Teasers</span>
                  <p className="text-xs font-black text-gray-900 dark:text-white mt-1">
                    {file.previewFiles ? `${file.previewFiles.filter(p => p.isUnblurred).length} public` : "0"}
                  </p>
                </div>
              </div>

              {/* Creator & Security Details */}
              <div className="space-y-2 pt-2 border-t border-gray-150 dark:border-zinc-800 text-xs">
                <div className="flex items-center justify-between text-gray-600 dark:text-zinc-400">
                  <span>Creator Alias:</span>
                  <span className="font-bold text-gray-900 dark:text-white">{file.creatorName || "Creator"}</span>
                </div>
                <div className="flex items-center justify-between text-gray-600 dark:text-zinc-400">
                  <span>File Reference:</span>
                  <span className="font-mono text-[11px] text-gray-700 dark:text-zinc-300 truncate max-w-[150px]">{file.fileName}</span>
                </div>
                <div className="flex items-center justify-between text-gray-600 dark:text-zinc-400">
                  <span>Security Rules:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Enforced
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="space-y-2.5 pt-4 border-t border-gray-150 dark:border-zinc-800">
              {/* Copy Paywall Link Button */}
              <button
                id="asset-preview-modal-copy-link-btn"
                onClick={() => onCopyLink(file.id)}
                className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer hover:scale-[1.01]"
              >
                {isCopied ? <Check className="w-4 h-4 text-white" /> : <Clipboard className="w-4 h-4 text-white" />}
                <span>{isCopied ? "Paywall Link Copied!" : "Copy Paywall Link"}</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                {/* Open Paywall in New Tab */}
                <a
                  href={paywallUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-800 dark:text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center space-x-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Paywall</span>
                </a>

                {/* Download Preview Image */}
                {currentImageUrl && (
                  <button
                    onClick={handleDownloadThumbnail}
                    className="py-2.5 px-3 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-800 dark:text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                    title="Download current preview image"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Save Image</span>
                  </button>
                )}
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
