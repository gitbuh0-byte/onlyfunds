import { Twitter, MessageSquare, Facebook, Share2, Info, Sparkles, Check, Copy } from "lucide-react";
import { SharedFile } from "../types";
import { useState } from "react";

interface SocialPreviewProps {
  file: SharedFile;
}

export default function SocialPreview({ file }: SocialPreviewProps) {
  const [activeTab, setActiveTab] = useState<"twitter" | "discord" | "facebook">("twitter");
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}/f/${file.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getFileEmoji = (type: string) => {
    switch (type) {
      case "document": return "📄";
      case "video": return "🎥";
      case "image": return "🖼️";
      default: return "📦";
    }
  };

  return (
    <div id="social-preview-card" className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl p-6 shadow-xs text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Share2 className="w-5 h-5 text-teal-500" />
            <span>Social Preview Container Sim</span>
          </h3>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
            See exactly how Only Funds populates the dynamic meta tags container on social media platforms.
          </p>
        </div>

        <button
          onClick={handleCopyLink}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-semibold rounded-lg transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-teal-500" /> : <Copy className="w-3.5 h-3.5 text-gray-500" />}
          <span>{copied ? "Copied Share Link" : "Copy Live Link"}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-zinc-950 p-1 rounded-xl mb-6">
        <button
          onClick={() => setActiveTab("twitter")}
          className={`flex-1 flex items-center justify-center space-x-1.5 py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === "twitter"
              ? "bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-xs"
              : "text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          <Twitter className="w-3.5 h-3.5 text-sky-500 fill-sky-500" />
          <span>Twitter / X Card</span>
        </button>
        <button
          onClick={() => setActiveTab("discord")}
          className={`flex-1 flex items-center justify-center space-x-1.5 py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === "discord"
              ? "bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-xs"
              : "text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
          <span>Discord Embed</span>
        </button>
        <button
          onClick={() => setActiveTab("facebook")}
          className={`flex-1 flex items-center justify-center space-x-1.5 py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === "facebook"
              ? "bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-xs"
              : "text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          <Facebook className="w-3.5 h-3.5 text-blue-600 fill-blue-600" />
          <span>Facebook Feed</span>
        </button>
      </div>

      {/* Preview container boxes */}
      <div className="bg-gray-50 dark:bg-zinc-950 p-4 rounded-2xl border border-gray-100 dark:border-zinc-900 font-sans">
        
        {/* Twitter Simulation */}
        {activeTab === "twitter" && (
          <div className="space-y-3">
            <div className="flex items-start space-x-3 text-left">
              <img
                src="https://api.dicebear.com/7.x/bottts/svg?seed=OnlyFundsBot"
                alt="X Bot"
                className="w-10 h-10 rounded-full border border-gray-200 dark:border-zinc-800"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-1.5">
                  <span className="text-sm font-bold text-gray-900 dark:text-white">Only Funds Bot</span>
                  <span className="text-xs text-gray-500">@onlyfunds_co • 1m</span>
                </div>
                <p className="text-xs text-gray-800 dark:text-zinc-200 mt-1 leading-relaxed">
                  Hey guys! Just published my brand new digital asset {getFileEmoji(file.fileType)} <span className="text-sky-500">"{file.title}"</span>. Lock security fee is set to <b>${file.fee.toFixed(2)}</b>. Check it out and unlock it below! 👇
                </p>

                {/* Twitter Summary Large Image Card container pop up */}
                <div className="mt-3 border border-gray-200 dark:border-zinc-850 rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 shadow-xs hover:border-sky-400 dark:hover:border-sky-500/30 transition-all cursor-pointer">
                  <div className="h-44 relative bg-zinc-150 dark:bg-zinc-800">
                    <img
                      src={file.coverUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800"}
                      alt={file.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center backdrop-blur-xs opacity-0 hover:opacity-100 transition-opacity">
                      <span className="bg-white/95 text-zinc-900 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md">
                        🔒 Click to Unlock Asset
                      </span>
                    </div>
                  </div>
                  <div className="p-3.5 text-left border-t border-gray-100 dark:border-zinc-850">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-gray-500 font-mono">onlyfunds.co</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white mt-1 line-clamp-1">🔒 ONLY FUNDS: Unlock {file.title}</p>
                    <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5 line-clamp-1 leading-relaxed">{file.description} | Set Security Fee: ${file.fee.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Discord Simulation */}
        {activeTab === "discord" && (
          <div className="bg-[#313338] text-zinc-300 p-4 rounded-xl space-y-3 font-sans">
            <div className="flex items-start space-x-3">
              <img
                src="https://api.dicebear.com/7.x/identicon/svg?seed=creator"
                alt="Discord user"
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1 text-left">
                <div className="flex items-baseline space-x-2">
                  <span className="text-sm font-semibold text-white">ShareCreator</span>
                  <span className="text-[10px] text-zinc-400">Today at 12:44 PM</span>
                </div>
                <p className="text-xs text-zinc-200 mt-1">
                  Just posted this on Only Funds: {shareUrl}
                </p>

                {/* Discord rich embed container */}
                <div className="mt-2.5 border-l-4 border-teal-500 bg-[#2b2d31] p-3.5 rounded-r-md max-w-md">
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Only Funds</p>
                  <a href="#" className="text-sm font-bold text-[#00a8fc] hover:underline block mt-1">
                    🔒 ONLY FUNDS: Unlock {file.title}
                  </a>
                  <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                    {file.description} | Pay ${file.fee.toFixed(2)} security fee to unlock.
                  </p>
                  
                  <div className="mt-3 rounded-lg overflow-hidden border border-zinc-700 bg-zinc-800">
                    <img
                      src={file.coverUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800"}
                      alt={file.title}
                      className="max-h-48 w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Facebook Simulation */}
        {activeTab === "facebook" && (
          <div className="space-y-3">
            <div className="flex items-start space-x-3 text-left">
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=OnlyCreator"
                alt="FB Creator"
                className="w-10 h-10 rounded-full border border-gray-200 dark:border-zinc-850"
              />
              <div className="flex-1 text-left">
                <div className="flex items-center space-x-1.5">
                  <span className="text-sm font-bold text-gray-900 dark:text-white">Creative sharing</span>
                  <span className="text-xs text-gray-400">Just now • 🌐</span>
                </div>
                <p className="text-xs text-gray-800 dark:text-zinc-200 mt-1">
                  Super excited to share my exclusive files securely with you! Only Funds manages escrow safely. Enter code on checkout screen to download.
                </p>

                {/* FB Link Preview container */}
                <div className="mt-3 border border-gray-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900">
                  <img
                    src={file.coverUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800"}
                    alt={file.title}
                    className="w-full h-44 object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="p-3 bg-gray-100 dark:bg-zinc-900 text-left border-t border-gray-150 dark:border-zinc-800">
                    <p className="text-[10px] text-gray-500 uppercase font-mono">ONLYFUNDS.CO</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white mt-1 leading-snug line-clamp-1">🔒 ONLY FUNDS: Unlock {file.title}</p>
                    <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5 line-clamp-1 leading-relaxed">{file.description} | Secure lock</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      <div className="mt-4 flex items-start gap-2 bg-teal-50/40 dark:bg-teal-950/15 p-3 rounded-xl border border-teal-100/50 dark:border-teal-900/30">
        <Info className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
        <p className="text-[11px] text-teal-700 dark:text-teal-300 leading-relaxed">
          <b>Why is this container preview popup important?</b> Social platforms read the metadata dynamically from our Express server headers. This triggers high-engagement visual containers that improve your paywall link conversions by up to 2.5x.
        </p>
      </div>
    </div>
  );
}
