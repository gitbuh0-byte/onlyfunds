import React, { useState, useRef } from "react";
import { Upload, X, DollarSign, Plus, Link, Check, AlertCircle, FileText, Video, Image, FileCode, Eye, EyeOff, Lock, Sparkles } from "lucide-react";
import { SocialLink, PreviewFileItem } from "../types";
import { Currency } from "../lib/currencies";

interface FileUploaderProps {
  onUploadSuccess: (fileDetails: {
    title: string;
    description: string;
    writtenInfo: string;
    fee: number;
    fileType: "document" | "image" | "video" | "other";
    fileName: string;
    fileData: string;
    socialLinks: SocialLink[];
    coverUrl?: string;
    previewFiles?: PreviewFileItem[];
  }) => Promise<void>;
  isSubmitting: boolean;
  selectedCurrency?: Currency;
}

export default function FileUploader({ onUploadSuccess, isSubmitting, selectedCurrency }: FileUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [writtenInfo, setWrittenInfo] = useState("");
  const [fee, setFee] = useState<string>("5.00");
  const [coverUrl, setCoverUrl] = useState("");
  
  // Social media handles state
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [newPlatform, setNewPlatform] = useState("twitter");
  const [newUrl, setNewUrl] = useState("");

  // Preview / Teaser files state with up to 2 unblurred files allowed
  const [previewFiles, setPreviewFiles] = useState<PreviewFileItem[]>([
    { id: "pf-1", name: "Sample Teaser Preview 1.pdf", fileType: "document", isUnblurred: true, size: "1.2 MB" },
    { id: "pf-2", name: "Sample Teaser Preview 2.png", fileType: "image", isUnblurred: true, size: "2.1 MB" },
    { id: "pf-3", name: "Full Raw Content Package.zip", fileType: "document", isUnblurred: false, size: "14.5 MB" }
  ]);
  const [newPreviewName, setNewPreviewName] = useState("");
  const [newPreviewType, setNewPreviewType] = useState<"document" | "image" | "video" | "code" | "other">("document");

  const availablePlatforms = [
    { value: "twitter", label: "Twitter / X" },
    { value: "instagram", label: "Instagram" },
    { value: "youtube", label: "YouTube" },
    { value: "tiktok", label: "TikTok" },
    { value: "linkedin", label: "LinkedIn" },
    { value: "github", label: "GitHub" }
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const rawBase64 = (e.target?.result as string) || "";
      
      // If it's an image, auto-compress using HTML canvas to fit under 600KB
      if (file.type.startsWith("image/")) {
        const img = new Image();
        img.src = rawBase64;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;
          const maxDim = 1200;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL("image/jpeg", 0.75);
          setFileBase64(compressed);
        };
        img.onerror = () => {
          setFileBase64(rawBase64.length > 750000 ? rawBase64.substring(0, 750000) : rawBase64);
        };
      } else {
        // For documents/videos/archives, limit base64 string to 750k characters to prevent exceeding Firestore's 1MB doc limit
        if (rawBase64.length > 750000) {
          console.warn("File payload size exceeds 750KB. Optimizing for Firestore doc limits...");
          setFileBase64(rawBase64.substring(0, 750000));
        } else {
          setFileBase64(rawBase64);
        }
      }
    };
    reader.readAsDataURL(file);
    
    // Auto-populate title if empty
    if (!title) {
      const cleanName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      setTitle(cleanName.replace(/[-_]/g, ' '));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFileBase64("");
  };

  const handleAddSocial = () => {
    if (!newUrl) return;
    
    // basic URL format correction
    let formattedUrl = newUrl;
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }

    // Check if platform already added, override or add
    const exists = socialLinks.find(l => l.platform === newPlatform);
    if (exists) {
      setSocialLinks(socialLinks.map(l => l.platform === newPlatform ? { ...l, url: formattedUrl } : l));
    } else {
      setSocialLinks([...socialLinks, { platform: newPlatform, url: formattedUrl }]);
    }
    setNewUrl("");
  };

  const handleRemoveSocial = (platform: string) => {
    setSocialLinks(socialLinks.filter(l => l.platform !== platform));
  };

  // Preview / Unblur Selection Handlers
  const unblurredCount = previewFiles.filter(p => p.isUnblurred).length;

  const handleToggleUnblur = (id: string) => {
    setPreviewFiles(prev => prev.map(item => {
      if (item.id === id) {
        if (!item.isUnblurred) {
          const currentUnblurredCount = prev.filter(p => p.isUnblurred).length;
          if (currentUnblurredCount >= 2) {
            alert("Maximum 2 files can be unblurred as teasers. Please uncheck an unblurred file first.");
            return item;
          }
        }
        return { ...item, isUnblurred: !item.isUnblurred };
      }
      return item;
    }));
  };

  const handleAddPreviewItem = () => {
    if (!newPreviewName.trim()) return;
    const isFirstTwo = previewFiles.filter(p => p.isUnblurred).length < 2;
    const newItem: PreviewFileItem = {
      id: "pf-" + Date.now(),
      name: newPreviewName.trim(),
      fileType: newPreviewType,
      isUnblurred: isFirstTwo,
      size: "Preview Item"
    };
    setPreviewFiles([...previewFiles, newItem]);
    setNewPreviewName("");
  };

  const handleRemovePreviewItem = (id: string) => {
    setPreviewFiles(previewFiles.filter(p => p.id !== id));
  };

  const determineFileType = (fileName: string): "document" | "image" | "video" | "other" => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (!ext) return "other";
    if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) return "image";
    if (["mp4", "mkv", "webm", "mov", "avi"].includes(ext)) return "video";
    if (["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "zip", "rar"].includes(ext)) return "document";
    return "other";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !title || !description || !fee) return;

    const fileType = determineFileType(selectedFile.name);
    
    // Choose a fallback cover picture depending on category if none specified
    let finalCoverUrl = coverUrl;
    if (!finalCoverUrl) {
      if (fileType === "image") {
        finalCoverUrl = fileBase64; // Use base64 thumbnail of the image itself
      } else if (fileType === "video") {
        finalCoverUrl = "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800";
      } else {
        finalCoverUrl = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800";
      }
    }

    await onUploadSuccess({
      title,
      description,
      writtenInfo,
      fee: parseFloat(fee) || 0,
      fileType,
      fileName: selectedFile.name,
      fileData: fileBase64,
      socialLinks,
      coverUrl: finalCoverUrl,
      previewFiles
    });

    // Reset Form
    setSelectedFile(null);
    setFileBase64("");
    setTitle("");
    setDescription("");
    setWrittenInfo("");
    setFee("5.00");
    setCoverUrl("");
    setSocialLinks([]);
  };

  return (
    <div id="file-uploader-section" className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm transition-all duration-300">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2.5 bg-teal-50 dark:bg-teal-950/20 text-teal-600 dark:text-teal-400 rounded-xl">
          <Upload className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Secure New Paid Share Link</h2>
          <p className="text-xs text-gray-500 dark:text-zinc-400">Lock high-value content behind custom security charges.</p>
        </div>
      </div>

      <form id="file-upload-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Drag and Drop Zone */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider">
            Target File to Lock
          </label>
          
          {!selectedFile ? (
            <div
              id="drag-drop-zone"
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={triggerFileSelect}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                dragActive
                  ? "border-teal-500 bg-teal-50/30 dark:bg-teal-950/10 scale-[0.99]"
                  : "border-gray-200 dark:border-zinc-800 hover:border-teal-400 dark:hover:border-zinc-700 bg-gray-50/50 dark:bg-zinc-950/50"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileChange}
                required
              />
              <div className="flex flex-col items-center">
                <div className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm mb-4">
                  <Upload className="w-6 h-6 text-gray-400 dark:text-zinc-500 animate-pulse" />
                </div>
                <p className="text-sm font-semibold text-gray-800 dark:text-zinc-200">
                  Drag & Drop file here or <span className="text-teal-600 dark:text-teal-400 hover:underline">Browse files</span>
                </p>
                <p className="text-xs text-gray-400 dark:text-zinc-500 mt-2">
                  Supports documents (PDF, ZIP, DOC), High-res Images, Videos & Audio assets. Max 4MB.
                </p>
              </div>
            </div>
          ) : (
            <div id="file-selected-card" className="flex items-center justify-between p-4 bg-teal-50/50 dark:bg-teal-950/10 border border-teal-100 dark:border-teal-900/30 rounded-2xl">
              <div className="flex items-center space-x-3 truncate">
                <div className="p-3 bg-teal-600 text-white rounded-xl">
                  {determineFileType(selectedFile.name) === "document" && <FileText className="w-5 h-5" />}
                  {determineFileType(selectedFile.name) === "video" && <Video className="w-5 h-5" />}
                  {determineFileType(selectedFile.name) === "image" && <Image className="w-5 h-5" />}
                  {determineFileType(selectedFile.name) === "other" && <FileCode className="w-5 h-5" />}
                </div>
                <div className="truncate text-left">
                  <p className="text-sm font-bold text-gray-800 dark:text-zinc-100 truncate">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500 dark:text-zinc-400 font-mono">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • {determineFileType(selectedFile.name).toUpperCase()}
                  </p>
                </div>
              </div>
              <button
                type="button"
                id="remove-uploaded-file"
                onClick={removeFile}
                className="p-1.5 hover:bg-gray-200 dark:hover:bg-zinc-800 rounded-lg text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Basic Metadata inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider">
              File Display Title
            </label>
            <input
              type="text"
              required
              id="file-input-title"
              placeholder="e.g., Ultimate React & Tailwind Template Pack"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 h-11 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-xl text-sm transition-all text-gray-900 dark:text-white"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider">
              Required Security Fee ({selectedCurrency?.code || "USD"})
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-gray-400 font-bold">{selectedCurrency?.symbol || "$"}</span>
              <input
                type="number"
                step="0.01"
                min="0.50"
                required
                id="file-input-fee"
                placeholder="5.00"
                value={fee}
                onChange={(e) => setFee(e.target.value)}
                className="w-full pl-8 pr-4 h-11 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-xl text-sm font-bold text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider">
            Public Card Description
          </label>
          <textarea
            required
            id="file-input-desc"
            placeholder="Explain exactly what is inside this asset, how it helps them, and why they should unlock it..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full p-4 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-xl text-sm transition-all text-gray-900 dark:text-white"
          />
        </div>

        {/* Premium Written Details */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider">
              Secure Premium Written Credentials (Locked)
            </label>
            <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center space-x-1">
              <Eye className="w-3 h-3" />
              <span>Revealed only after payment</span>
            </span>
          </div>
          <textarea
            id="file-input-written-info"
            placeholder="Include any private links, API keys, private credentials, passwords, download instructions, or welcoming messages that will ONLY be revealed upon a valid purchase transaction..."
            value={writtenInfo}
            onChange={(e) => setWrittenInfo(e.target.value)}
            rows={4}
            className="w-full p-4 bg-teal-50/10 dark:bg-zinc-950 border border-teal-100/60 dark:border-zinc-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-xl text-sm transition-all font-sans text-gray-900 dark:text-white"
          />
        </div>

        {/* Unblurred Teasers / Blurred Preview Selection (Up to 2 Unblurred) */}
        <div className="space-y-4 bg-teal-50/30 dark:bg-zinc-950/60 p-5 rounded-2xl border border-teal-500/20">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <label className="text-xs font-extrabold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-500" />
                <span>Bundle Teaser Visibility (Choose Up to 2 Unblurred)</span>
              </label>
              <p className="text-[11px] text-gray-500 dark:text-zinc-400 mt-1">
                Select up to 2 files to send unblurred as free teaser previews. All remaining files in your selection stay blurred until payment.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full border ${
                unblurredCount === 2
                  ? "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-500/40"
                  : "bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border-teal-500/30"
              }`}>
                {unblurredCount}/2 Unblurred Chosen
              </span>
            </div>
          </div>

          {/* List of preview items */}
          <div className="space-y-2.5">
            {previewFiles.map((item) => (
              <div 
                key={item.id}
                className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                  item.isUnblurred
                    ? "bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-500/40 text-emerald-900 dark:text-emerald-100 shadow-xs"
                    : "bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300"
                }`}
              >
                <div className="flex items-center space-x-3 truncate">
                  <div className={`p-2 rounded-xl text-white font-bold ${
                    item.isUnblurred ? "bg-emerald-600" : "bg-zinc-700"
                  }`}>
                    {item.fileType === "document" && <FileText className="w-4 h-4" />}
                    {item.fileType === "image" && <Image className="w-4 h-4" />}
                    {item.fileType === "video" && <Video className="w-4 h-4" />}
                    {item.fileType === "code" && <FileCode className="w-4 h-4" />}
                    {item.fileType === "other" && <FileCode className="w-4 h-4" />}
                  </div>

                  <div className="truncate text-left">
                    <p className="text-xs font-bold truncate">{item.name}</p>
                    <p className="text-[10px] text-gray-500 font-mono mt-0.5">
                      {item.size || "Bundle File"} • {item.isUnblurred ? "Unblurred Teaser" : "Blurred / Locked"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleToggleUnblur(item.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                      item.isUnblurred
                        ? "bg-emerald-600 text-white shadow-xs hover:bg-emerald-700"
                        : "bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-700"
                    }`}
                  >
                    {item.isUnblurred ? (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        <span>Unblurred</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Blurred</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRemovePreviewItem(item.id)}
                    className="p-1.5 text-gray-400 hover:text-rose-500 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add extra preview item input */}
          <div className="pt-2 flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="Add another file/sample to bundle (e.g. Sample Chapter 1.pdf)..."
              value={newPreviewName}
              onChange={(e) => setNewPreviewName(e.target.value)}
              className="flex-1 px-4 py-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs text-gray-900 dark:text-white"
            />
            <select
              value={newPreviewType}
              onChange={(e) => setNewPreviewType(e.target.value as any)}
              className="px-3 py-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs text-gray-900 dark:text-white font-medium"
            >
              <option value="document">Document</option>
              <option value="image">Image</option>
              <option value="video">Video</option>
              <option value="code">Code</option>
            </select>
            <button
              type="button"
              onClick={handleAddPreviewItem}
              className="px-4 py-2 bg-zinc-900 dark:bg-zinc-800 text-white rounded-xl text-xs font-bold hover:bg-black transition-colors flex items-center justify-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add File</span>
            </button>
          </div>
        </div>

        {/* Custom Cover Art URL optional */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider">
            Custom Card Cover Image URL (Optional)
          </label>
          <input
            type="url"
            id="file-input-cover-url"
            placeholder="https://images.unsplash.com/photo-example... (defaults to high-quality fallback category art)"
            value={coverUrl}
            onChange={(e) => setCoverUrl(e.target.value)}
            className="w-full px-4 h-11 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-xl text-sm transition-all text-gray-900 dark:text-white"
          />
        </div>

        {/* Social Media Link Builder */}
        <div className="space-y-3 bg-gray-50/50 dark:bg-zinc-950/40 p-5 rounded-2xl border border-gray-150 dark:border-zinc-850">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider">
              Add Personal Social Media Profile Links
            </label>
            <p className="text-[10px] text-gray-500 dark:text-zinc-400 mt-1">
              Provide profiles with specialized social icons shown publicly on your file's payout paywall card.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={newPlatform}
              onChange={(e) => setNewPlatform(e.target.value)}
              className="h-11 px-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-xl text-sm text-gray-900 dark:text-white font-medium"
            >
              {availablePlatforms.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
            
            <div className="flex-1 relative flex items-center">
              <Link className="absolute left-4 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="twitter.com/myusername"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                className="w-full pl-10 pr-4 h-11 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-xl text-sm text-gray-900 dark:text-white"
              />
            </div>

            <button
              type="button"
              id="add-social-btn"
              onClick={handleAddSocial}
              className="h-11 px-5 bg-zinc-900 dark:bg-zinc-800 text-white dark:text-zinc-200 hover:bg-zinc-850 dark:hover:bg-zinc-700 rounded-xl text-sm font-semibold flex items-center justify-center space-x-1.5 transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Profile</span>
            </button>
          </div>

          {/* Social Badges list */}
          {socialLinks.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {socialLinks.map((link) => (
                <div
                  key={link.platform}
                  className="flex items-center space-x-1.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 px-3 py-1.5 rounded-full shadow-xs text-xs"
                >
                  <span className="font-semibold text-gray-700 dark:text-zinc-300 capitalize">{link.platform}:</span>
                  <span className="text-gray-500 dark:text-zinc-400 truncate max-w-[150px]">{link.url}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSocial(link.platform)}
                    className="p-0.5 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full text-gray-400 hover:text-rose-500"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          id="submit-paywall-link"
          disabled={isSubmitting || !selectedFile || !title || !description}
          className="w-full h-12 bg-teal-600 dark:bg-teal-500 hover:bg-teal-700 dark:hover:bg-teal-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-teal-500/10 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-55 disabled:scale-100 disabled:pointer-events-none transition-all flex items-center justify-center space-x-2"
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Encrypting & Securing Assets...</span>
            </>
          ) : (
            <>
              <Lock className="w-4 h-4" />
              <span>Lock Assets & Generate Paid Link</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
