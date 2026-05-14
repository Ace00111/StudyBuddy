"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useUploadBlobs, type WalletAdapterSigner } from "@shelby-protocol/react";
import { Upload, Link as LinkIcon, AlertCircle } from "lucide-react";
import { Material } from "@/lib/materials";

interface UploadBoxProps {
  onUpload: (material: Material) => void;
  defaultCategory?: Material["category"];
}

export default function UploadBox({ onUpload, defaultCategory = "lectures" }: UploadBoxProps) {
  const wallet = useWallet();
  const { account } = wallet;
  const [file, setFile] = useState<File | null>(null);
  const [link, setLink] = useState("");
  const [category, setCategory] = useState<Material["category"]>(defaultCategory);

  const uploadBlobs = useUploadBlobs({
    onSuccess: () => {
      console.log("[Shelby] Upload successful");
    },
    onError: (error) => {
      console.error("[Shelby] Upload failed:", error);
      alert(`Upload failed: ${error.message}`);
    }
  });

  useEffect(() => {
    setCategory(defaultCategory);
  }, [defaultCategory]);

  const handleUploadFile = async () => {
    if (!account) {
      alert("Please connect your wallet to upload files.");
      return;
    }
    if (!file) return;

    try {
      const buffer = await file.arrayBuffer();
      const blobData = new Uint8Array(buffer);
      
      // Expiration: 1 year from now in microseconds
      const expirationMicros = (Date.now() + 365 * 24 * 60 * 60 * 1000) * 1000;

      uploadBlobs.mutate({
        signer: wallet as WalletAdapterSigner,
        blobs: [
          {
            blobName: `${account.address}/${file.name}`,
            blobData,
          }
        ],
        expirationMicros,
      }, {
        onSuccess: () => {
          onUpload({
            id: crypto.randomUUID(),
            name: file.name,
            type: "file",
            category,
            shelbyId: `${account.address}/${file.name}`,
            size: file.size,
            createdAt: new Date().toISOString()
          });
          
          alert(`File uploaded successfully!`);
          setFile(null);
        }
      });
      
    } catch (error) {
      alert(`Upload preparation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleAddLink = () => {
    if (!account) {
      alert("Please connect your wallet to add links.");
      return;
    }
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

  return (
    <div className="flex flex-col gap-4 mb-8">
      {!account && (
        <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl mb-2">
          <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
             <AlertCircle className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold text-amber-500">Guest Mode Active</p>
            <p className="text-[10px] text-amber-500/80">Connecting your wallet will activate decentralized sync to Shelby Protocol.</p>
          </div>
          <button 
            onClick={() => document.getElementById('wallet-connect-btn')?.click()}
            className="text-[10px] font-black text-amber-500 hover:underline uppercase"
          >
            Connect Now
          </button>
        </div>
      )}

      {/* Category Selector */}
      <div className="flex items-center gap-3 px-4 py-2 bg-slate-900 rounded-xl w-fit self-end border border-slate-800">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Target:</span>
        <select 
          value={category}
          onChange={(e) => setCategory(e.target.value as Material["category"])}
          className="bg-transparent text-sm font-semibold outline-none border-0 focus:ring-0 cursor-pointer text-slate-300"
        >
          <option value="lectures" className="bg-slate-900 text-white">Lectures</option>
          <option value="notes" className="bg-slate-900 text-white">Study Notes</option>
          <option value="assignments" className="bg-slate-900 text-white">Assignments</option>
          <option value="general" className="bg-slate-900 text-white">General</option>
        </select>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 bg-card border border-slate-800 rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
            <Upload className="w-5 h-5" />
          </div>
          <div className="flex-1 overflow-hidden">
            <input 
              type="file" 
              className="text-sm w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-slate-800 file:text-slate-300 hover:file:bg-slate-700 cursor-pointer"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>
          <button 
            onClick={handleUploadFile}
            disabled={!file || uploadBlobs.isPending || !account}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            {uploadBlobs.isPending ? "Uploading..." : "Upload"}
          </button>
        </div>


        <div className="flex-1 bg-card border border-slate-800 rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 shrink-0">
            <LinkIcon className="w-5 h-5" />
          </div>
          <input 
            type="text" 
            placeholder="Paste external link..."
            className="flex-1 bg-transparent border-0 focus:ring-0 text-sm outline-none placeholder:text-slate-500 text-white"
            value={link}
            onChange={(e) => setLink(e.target.value)}
          />
          <button 
            onClick={handleAddLink}
            disabled={!link || !account}
            className="px-4 py-2 bg-slate-100 text-slate-900 hover:bg-slate-200 disabled:opacity-50 text-sm font-black rounded-lg transition-colors flex items-center gap-2 uppercase tracking-tighter"
          >
            Add Link
          </button>
        </div>

      </div>
    </div>
  );
}

