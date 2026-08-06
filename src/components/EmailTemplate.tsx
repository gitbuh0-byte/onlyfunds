import { Mail, Copy, Check, Eye, Code, Sparkles } from "lucide-react";
import { SharedFile } from "../types";
import { useState } from "react";

interface EmailTemplateProps {
  file: SharedFile;
}

export default function EmailTemplate({ file }: EmailTemplateProps) {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<"preview" | "code">("preview");

  const shareUrl = `${window.location.origin}/f/${file.id}`;
  const fileCover = file.coverUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800";

  // Unique responsive, inlined CSS HTML email template design
  const htmlEmailCode = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Premium Unlock Link - Only Funds</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f6f8;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f4f6f8;padding:40px 10px;">
    <tr>
      <td align="center">
        <!-- Card Container -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:580px;background-color:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.04);border:1px solid #eef2f5;">
          
          <!-- Gradient Header -->
          <tr>
            <td style="background:linear-gradient(135deg, #0d9488 0%, #059669 100%);padding:30px;text-align:center;">
              <table align="center" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="color:#ffffff;font-size:24px;font-weight:bold;letter-spacing:-0.5px;">
                    Only<span style="color:#ccfbf1;">Funds</span>
                  </td>
                </tr>
                <tr>
                  <td style="color:#ccfbf1;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;padding-top:4px;">
                    SECURE DIGITAL ASSETS
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Cover Image -->
          <tr>
            <td align="center" style="padding:0;">
              <img src="${fileCover}" alt="${file.title}" width="100%" style="display:block;max-height:280px;object-cover:cover;border:0;" />
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding:40px 30px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="color:#0f172a;font-size:22px;font-weight:800;line-height:28px;text-align:center;padding-bottom:12px;">
                    🔒 Unlock Premium Asset
                  </td>
                </tr>
                <tr>
                  <td style="color:#334155;font-size:18px;font-weight:700;line-height:24px;text-align:center;padding-bottom:16px;">
                    "${file.title}"
                  </td>
                </tr>
                <tr>
                  <td style="color:#64748b;font-size:14px;line-height:22px;text-align:center;padding-bottom:30px;">
                    ${file.description}
                  </td>
                </tr>

                <!-- Call to Action Button -->
                <tr>
                  <td align="center" style="padding-bottom:15px;">
                    <table border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="background-color:#0d9488;border-radius:14px;">
                          <a href="${shareUrl}" target="_blank" style="display:inline-block;padding:16px 36px;color:#ffffff;font-size:16px;font-weight:bold;text-decoration:none;letter-spacing:0.5px;">
                            🔑 Unlock File for $${file.fee.toFixed(2)}
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td align="center" style="color:#94a3b8;font-size:11px;font-family:monospace;padding-bottom:30px;">
                    Secure lock managed by Only Funds escrow rules
                  </td>
                </tr>

                <!-- Divider -->
                <tr>
                  <td style="border-top:1px solid #f1f5f9;padding-top:24px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td align="center" style="color:#475569;font-size:13px;font-weight:bold;padding-bottom:6px;">
                          Created by ${file.creatorName}
                        </td>
                      </tr>
                      <tr>
                        <td align="center" style="color:#94a3b8;font-size:12px;">
                          ${file.creatorEmail}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f8fafc;padding:24px 30px;text-align:center;border-top:1px solid #f1f5f9;">
              <p style="margin:0;color:#94a3b8;font-size:12px;line-height:18px;">
                You received this because a creator shared a premium file via Only Funds.<br>
                For help or billing inquires support@onlyfunds.co
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(htmlEmailCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="email-template-view" className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl p-6 shadow-xs text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Mail className="w-5 h-5 text-teal-500" />
            <span>Unique Email Sharing Template</span>
          </h3>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
            Copy and send this responsive email flyer to your newsletter or mailing lists.
          </p>
        </div>

        <button
          onClick={handleCopyCode}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-semibold rounded-lg transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-teal-500" /> : <Copy className="w-3.5 h-3.5 text-gray-500" />}
          <span>{copied ? "Copied HTML Code" : "Copy Email HTML"}</span>
        </button>
      </div>

      {/* Mode selectors */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-zinc-950 p-1 rounded-xl mb-6">
        <button
          onClick={() => setViewMode("preview")}
          className={`flex-1 flex items-center justify-center space-x-1.5 py-2 text-xs font-bold rounded-lg transition-all ${
            viewMode === "preview"
              ? "bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-xs"
              : "text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          <Eye className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
          <span>Interactive Preview</span>
        </button>
        <button
          onClick={() => setViewMode("code")}
          className={`flex-1 flex items-center justify-center space-x-1.5 py-2 text-xs font-bold rounded-lg transition-all ${
            viewMode === "code"
              ? "bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-xs"
              : "text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          <Code className="w-3.5 h-3.5 text-indigo-500" />
          <span>Source Code (HTML)</span>
        </button>
      </div>

      {/* Render Box */}
      {viewMode === "preview" ? (
        <div className="border border-gray-150 dark:border-zinc-850 rounded-2xl overflow-hidden max-w-lg mx-auto bg-gray-55 shadow-inner scale-[0.98]">
          <div className="bg-gradient-to-r from-teal-700 to-emerald-600 p-6 text-center text-white">
            <span className="text-xl font-bold font-sans">Only<span className="text-teal-200">Funds</span></span>
            <p className="text-[10px] text-teal-100 uppercase font-semibold mt-1 tracking-wider">Secure Digital Assets</p>
          </div>
          
          <img
            src={fileCover}
            alt={file.title}
            className="w-full h-48 object-cover"
            referrerPolicy="no-referrer"
          />

          <div className="p-8 bg-white text-zinc-800 text-center text-left">
            <h4 className="text-xs text-teal-600 font-bold uppercase tracking-wider mb-2">🔒 Unlock Premium Asset</h4>
            <h3 className="text-lg font-extrabold text-zinc-900 leading-snug">"{file.title}"</h3>
            <p className="text-xs text-zinc-500 mt-3 leading-relaxed">{file.description}</p>
            
            <div className="mt-6">
              <a
                href={shareUrl}
                onClick={(e) => e.preventDefault()} // prevent page change inside app template view
                className="inline-block px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl transition-all shadow-md"
              >
                🔑 Unlock File for ${file.fee.toFixed(2)}
              </a>
            </div>
            
            <p className="text-[10px] text-zinc-400 mt-3 font-mono">Secure lock managed by Only Funds escrow rules</p>
            
            <div className="border-t border-zinc-100 mt-6 pt-5">
              <p className="text-xs font-bold text-zinc-700">Created by {file.creatorName}</p>
              <p className="text-xs text-zinc-400 mt-0.5">{file.creatorEmail}</p>
            </div>
          </div>
          
          <div className="bg-zinc-50 p-4 border-t border-zinc-100 text-center">
            <p className="text-[10px] text-zinc-400 leading-normal">
              You received this because a creator shared a premium file via Only Funds.<br />
              For help or billing inquiries contact support@onlyfunds.co
            </p>
          </div>
        </div>
      ) : (
        <div className="relative">
          <textarea
            readOnly
            value={htmlEmailCode}
            className="w-full h-80 p-4 font-mono text-xs bg-zinc-950 text-emerald-400 rounded-2xl border border-zinc-800 focus:outline-none resize-none"
          />
          <div className="absolute top-3 right-3 bg-zinc-900 text-[10px] text-zinc-400 px-2 py-1 rounded-md border border-zinc-800">
            HTML (CSS-Inlined)
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center space-x-2 bg-emerald-50/40 dark:bg-emerald-950/15 p-3 rounded-xl border border-emerald-100/50 dark:border-emerald-900/30">
        <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
          This email template design has all styles **inlined**, making it 100% responsive and compliant across Outlook, Apple Mail, and Gmail.
        </p>
      </div>
    </div>
  );
}
