"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { uploadToShelby } from "@/lib/shelby";
import { Upload, Link as LinkIcon } from "lucide-react";
import { Material } from "@/lib/materials";

interface UploadBoxProps {
  onUpload: (material: Material) => void;
  defaultCategory?: Material["category"];
}

export default function UploadBox({ onUpload, defaultCategory = "lectures" }: UploadBoxProps) {
  const { account } = useWallet();
  const [file, setFile] = useState<File | null>(null);
  const [link, setLink] = useState("");
  const [category, setCategory] = useState<Material["category"]>(defaultCategory);
  const [isUploading, setIsUploading] = useState(false);

  // Sync category state with prop when it changes (e.g. user clicks sidebar sub-link)
  useEffect(() => {
    setCategory(defaultCategory);
  }, [defaultCategory]);

  const handleUploadFile = async () => {
    if (!file || !account) return;
    setIsUploading(true);
    
    try {
      const shelbyId = await uploadToShelby(file, account.address);
      onUpload({
        id: crypto.randomUUID(),
        name: file.name,
        type: "file",
        category,
        shelbyId,
        size: file.size,
        createdAt: new Date().toISOString()
      });
      setFile(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddLink = () => {
    if (!link) return;
    onUpload({
      id: crypto.randomUUID(),
      name: link,
      type: "link",
      category,
      url: link,
      createdAt: new Date().toISOString()
    });
    setLink("");
  };

  if (!account) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-50" />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-primary border border-slate-700 shadow-xl group-hover:scale-110 transition-transform">
             <Upload className="w-8 h-8" />
          </div>
          <div>
            <h4 className="text-xl font-bold mb-2">Shelby Protocol Storage</h4>
            <p className="text-muted text-sm max-w-sm mx-auto mb-6">
              Connect your Aptos Wallet to activate decentralized file storage and global peer-to-peer syncing.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 mb-8">
      {/* Category Selector */}
      <div className="flex items-center gap-3 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit self-end">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Target:</span>
        <select 
          value={category}
          onChange={(e) => setCategory(e.target.value as Material["category"])}
          className="bg-transparent text-sm font-semibold outline-none border-0 focus:ring-0 cursor-pointer"
        >
          <option value="lectures">Lectures</option>
          <option value="notes">Study Notes</option>
          <option value="assignments">Assignments</option>
          <option value="general">General</option>
        </select>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
            <Upload className="w-5 h-5" />
          </div>
          <div className="flex-1 overflow-hidden">
            <input 
              type="file" 
              className="text-sm w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-slate-800 dark:file:text-slate-300 dark:hover:file:bg-slate-700 cursor-pointer"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>
          <button 
            onClick={handleUploadFile}
            disabled={!file || isUploading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            {isUploading ? "Uploading..." : "Upload"}
          </button>
        </div>

        <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center text-purple-500 shrink-0">
            <LinkIcon className="w-5 h-5" />
          </div>
          <input 
            type="text" 
            placeholder="Paste external link..."
            className="flex-1 bg-transparent border-0 focus:ring-0 text-sm outline-none placeholder:text-slate-400"
            value={link}
            onChange={(e) => setLink(e.target.value)}
          />
          <button 
            onClick={handleAddLink}
            disabled={!link}
            className="px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 disabled:opacity-50 text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            Add Link
          </button>
        </div>
      </div>
    </div>
  );
}

