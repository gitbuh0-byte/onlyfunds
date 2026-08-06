import React, { useState } from "react";
import { 
  Lock, Unlock, Eye, EyeOff, Sparkles, Maximize2, X, Download, 
  ShieldCheck, CheckCircle2, Layers, Grid, Droplets, ZoomIn, FileText, Image as ImageIcon, Video, FileCode
} from "lucide-react";
import { SharedFile } from "../types";
import { Currency, formatPrice } from "../lib/currencies";

interface FilePreviewCardProps {
  file: SharedFile;
  unlocked: boolean;
  selectedCurrency: Currency;
  onUnlockRequest?: () => void;
  downloadUrl?: string;
}

export default function FilePreviewCard({
  file,
  unlocked,
  selectedCurrency,
  onUnlockRequest,
  downloadUrl
}: FilePreviewCardProps) {
  const [previewStyle, setPreviewStyle] = useState<"blur" | "watermark" | "grid">("blur");
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [inspectComparison, setInspectComparison] = useState(false);

  // Default fallback image depending on file type if coverUrl is missing
  const defaultImage = file.coverUrl || (
    file.fileType === "video" 
      ? "https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800"
      : file.fileType === "document"
      ? "https://images.unsplash.com/photo-1568667256549-094345857637?w=800"
      : "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800"
  );

  return (
    <div id="file-preview-component" className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm text-left">
      
      {/* Top Header Bar for Preview Controls */}
      <div className="p-4 bg-gray-50 dark:bg-zinc-950 border-b border-gray-100 dark:border-zinc-800/80 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center space-x-2">
          <div className={`p-1.5 rounded-lg ${unlocked ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-amber-500/20 text-amber-600 dark:text-amber-400"}`}>
            {unlocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <span>{unlocked ? "Unlocked High-Res Asset" : "Watermarked Asset Preview"}</span>
            </h4>
            <p className="text-[10px] text-gray-500 dark:text-zinc-400 font-mono">
              {unlocked ? "Original file unblurred and ready" : "Blurred thumbnail preview • Protected by OnlyFunds"}
            </p>
          </div>
        </div>

        {/* Locked Preview Filter Selectors */}
        {!unlocked && (
          <div className="flex items-center space-x-1 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setPreviewStyle("blur")}
              title="Blur Filter"
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center space-x-1 transition-all cursor-pointer ${
                previewStyle === "blur" 
                  ? "bg-teal-600 text-white shadow-xs" 
                  : "text-gray-500 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-white"
              }`}
            >
              <Droplets className="w-3 h-3" />
              <span className="hidden sm:inline">Blurred</span>
            </button>

            <button
              type="button"
              onClick={() => setPreviewStyle("watermark")}
              title="Watermark Overlay"
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center space-x-1 transition-all cursor-pointer ${
                previewStyle === "watermark" 
                  ? "bg-teal-600 text-white shadow-xs" 
                  : "text-gray-500 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-white"
              }`}
            >
              <Layers className="w-3 h-3" />
              <span className="hidden sm:inline">Watermark</span>
            </button>

            <button
              type="button"
              onClick={() => setPreviewStyle("grid")}
              title="Grid Mask Filter"
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center space-x-1 transition-all cursor-pointer ${
                previewStyle === "grid" 
                  ? "bg-teal-600 text-white shadow-xs" 
                  : "text-gray-500 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-white"
              }`}
            >
              <Grid className="w-3 h-3" />
              <span className="hidden sm:inline">Grid</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Thumbnail Showcase Container */}
      <div className="relative h-72 sm:h-80 w-full overflow-hidden bg-zinc-950 flex items-center justify-center group">
        
        {/* Base Asset Image with conditional Blur / Filters */}
        <img
          src={defaultImage}
          alt={file.title}
          className={`w-full h-full object-cover transition-all duration-700 select-none ${
            unlocked 
              ? "blur-none scale-100 opacity-100" 
              : previewStyle === "blur"
              ? "blur-md sm:blur-lg scale-105 opacity-80"
              : previewStyle === "watermark"
              ? "blur-xs scale-102 opacity-70 contrast-125"
              : "blur-sm scale-102 opacity-60 grayscale-50"
          }`}
          referrerPolicy="no-referrer"
        />

        {/* Repeating Watermark Stamp Overlay when locked */}
        {!unlocked && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden flex flex-col justify-between p-4 opacity-40 select-none">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 transform -rotate-12 scale-125 translate-y-2">
              {Array.from({ length: 9 }).map((_, idx) => (
                <div key={idx} className="border border-white/30 bg-black/40 backdrop-blur-xs px-3 py-1.5 rounded-lg text-center">
                  <span className="text-[10px] sm:text-xs font-black text-white uppercase tracking-widest block font-mono">
                    ONLYFUNDS • WATERMARK
                  </span>
                  <span className="text-[8px] text-teal-300 font-bold block">
                    PREVIEW ONLY • UNLOCK FOR {formatPrice(file.fee, selectedCurrency)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Diagonal Subtle Grid Pattern Overlay */}
        {!unlocked && previewStyle === "grid" && (
          <div 
            className="absolute inset-0 pointer-events-none opacity-25" 
            style={{
              backgroundImage: "radial-gradient(circle, #2dd4bf 1px, transparent 1px)",
              backgroundSize: "16px 16px"
            }}
          />
        )}

        {/* Dark subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20 pointer-events-none" />

        {/* Center Floating Lock Badge & Quick Unlock Prompt */}
        {!unlocked ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10">
            <div className="p-4 bg-black/75 backdrop-blur-md border border-white/20 rounded-3xl shadow-2xl max-w-sm w-full space-y-3 transform group-hover:scale-105 transition-transform duration-300">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-amber-500 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Lock className="w-6 h-6 animate-pulse" />
              </div>

              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-teal-300 bg-teal-950/80 border border-teal-500/30 px-2.5 py-0.5 rounded-full">
                  Locked Asset Preview
                </span>
                <h3 className="text-sm font-black text-white mt-1.5 line-clamp-1">
                  {file.title}
                </h3>
                <p className="text-[11px] text-zinc-300 mt-1 font-mono">
                  Price: <span className="text-emerald-400 font-bold">{formatPrice(file.fee, selectedCurrency)}</span>
                </p>
              </div>

              <div className="pt-2 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsZoomOpen(true)}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer"
                >
                  <ZoomIn className="w-3.5 h-3.5 text-teal-300" />
                  <span>Inspect Lightbox</span>
                </button>

                {onUnlockRequest && (
                  <button
                    type="button"
                    onClick={onUnlockRequest}
                    className="px-3.5 py-1.5 bg-teal-500 hover:bg-teal-400 text-black text-xs font-black rounded-xl shadow-md transition-all flex items-center space-x-1 cursor-pointer"
                  >
                    <Unlock className="w-3.5 h-3.5" />
                    <span>Unlock Original</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Unlocked Success Badge Overlay */
          <div className="absolute top-4 right-4 z-10 animate-in zoom-in-95 duration-300">
            <div className="px-3 py-1.5 bg-emerald-500 text-white rounded-xl shadow-lg flex items-center space-x-1.5 text-xs font-black">
              <CheckCircle2 className="w-4 h-4" />
              <span>Unlocked Original Asset</span>
            </div>
          </div>
        )}

        {/* Bottom Bar overlay details inside image canvas */}
        <div className="absolute bottom-3 left-4 right-4 z-10 flex items-center justify-between text-white">
          <div className="flex items-center space-x-2">
            <span className="bg-black/60 backdrop-blur-md border border-white/20 text-white font-bold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full">
              {file.fileType.toUpperCase()}
            </span>
            <span className="text-[10px] text-zinc-300 font-mono hidden sm:inline">
              Creator: {file.creatorName}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsZoomOpen(true)}
            className="p-2 bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 rounded-xl text-white transition-colors cursor-pointer"
            title="Full Screen Preview Lightbox"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Footer Info Banner */}
      <div className="p-4 bg-gray-50/60 dark:bg-zinc-950/60 border-t border-gray-100 dark:border-zinc-800/80 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-zinc-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span className="text-[11px] font-medium">
            {unlocked 
              ? "High-resolution raw file unlocked and available for direct download."
              : "Watermarked thumbnail preview. Complete payment to unblur and download original."}
          </span>
        </div>

        {unlocked && downloadUrl && (
          <a
            href={downloadUrl}
            download={file.fileName || "unlocked-asset"}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Asset</span>
          </a>
        )}
      </div>

      {/* Full-Screen Preview Lightbox Modal */}
      {isZoomOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 text-left animate-in fade-in duration-200">
          <div className="relative max-w-4xl w-full bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-4 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-teal-500/20 text-teal-400 rounded-xl">
                  {unlocked ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white">{file.title}</h3>
                  <p className="text-[10px] text-zinc-400 font-mono">
                    Asset Lightbox Inspector • {unlocked ? "Unlocked Mode" : "Paywall Protected Sample"}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {!unlocked && (
                  <button
                    type="button"
                    onClick={() => setInspectComparison(!inspectComparison)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      inspectComparison 
                        ? "bg-amber-500/20 border-amber-500/40 text-amber-300" 
                        : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white"
                    }`}
                  >
                    {inspectComparison ? "Viewing Simulated Unblur" : "Simulate Unblur Effect"}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setIsZoomOpen(false)}
                  className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Canvas Body */}
            <div className="relative flex-1 bg-black flex items-center justify-center p-6 overflow-hidden min-h-[350px]">
              <img
                src={defaultImage}
                alt={file.title}
                className={`max-h-[60vh] w-auto object-contain rounded-2xl transition-all duration-500 ${
                  unlocked || inspectComparison
                    ? "blur-none opacity-100 scale-100"
                    : previewStyle === "blur"
                    ? "blur-xl opacity-80 scale-105"
                    : previewStyle === "watermark"
                    ? "blur-xs opacity-75 contrast-125"
                    : "blur-md opacity-65"
                }`}
                referrerPolicy="no-referrer"
              />

              {/* Lightbox Watermark overlay when locked and not simulating unblur */}
              {!unlocked && !inspectComparison && (
                <div className="absolute inset-0 pointer-events-none flex flex-col justify-around p-8 opacity-50 select-none">
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <div key={idx} className="flex justify-around transform -rotate-6">
                      <span className="text-xs sm:text-sm font-black text-white/80 bg-black/60 px-4 py-1 rounded-lg border border-white/20 font-mono tracking-widest">
                        ONLYFUNDS WATERMARK PREVIEW • {formatPrice(file.fee, selectedCurrency)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Simulation Banner notice */}
              {inspectComparison && !unlocked && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-amber-500/90 text-black text-xs font-black px-4 py-1.5 rounded-full shadow-lg border border-amber-300 flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>SIMULATED UNBLUR PREVIEW • COMPLETE PAYMENT TO ACCESS HIGH-RES DOWNLOAD</span>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between flex-wrap gap-3">
              <div className="text-xs text-zinc-400 font-mono">
                Price: <span className="text-emerald-400 font-bold">{formatPrice(file.fee, selectedCurrency)}</span>
              </div>

              {!unlocked ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsZoomOpen(false);
                    if (onUnlockRequest) onUnlockRequest();
                  }}
                  className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-black font-black text-xs rounded-xl shadow-lg hover:brightness-110 transition-all flex items-center space-x-2 cursor-pointer"
                >
                  <Unlock className="w-4 h-4" />
                  <span>Proceed to Paywall Checkout</span>
                </button>
              ) : (
                <span className="text-xs font-extrabold text-emerald-400 flex items-center space-x-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Asset Fully Unlocked</span>
                </span>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
