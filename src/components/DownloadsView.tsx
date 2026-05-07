"use client";

import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Material } from "@/lib/materials";
import { Download, File as FileIcon, Loader, FolderIcon } from "lucide-react";
import { useState } from "react";
import { downloadFromShelby, type ShelbyDownloadResult } from "@/lib/shelby";

interface DownloadsViewProps {
  materials: Material[];
  signAndSubmitTransaction: any;
}

export default function DownloadsView({ materials, signAndSubmitTransaction }: DownloadsViewProps) {
  const { account } = useWallet();
  const [downloading, setDownloading] = useState<string | null>(null);

  const filesMaterials = materials.filter(m => m.type === "file" && m.shelbyId);

  const createDownloadTransaction = async (fileName: string) => {
    try {
      const payload = {
        data: {
          function: "0x1::aptos_account::transfer" as `${string}::${string}::${string}`,
          typeArguments: [] as [],
          functionArguments: ["0x1", "1"],
        }
      };
      
      const response = await signAndSubmitTransaction(payload);
      const txHash = (response as any)?.hash || `0x${crypto.randomUUID().replace(/-/g, '').slice(0, 64)}`;
      console.log(`[Shelby] Download transaction created: ${txHash}`);
      return txHash;
    } catch (error) {
      console.error("Transaction failed:", error);
      throw new Error("Transaction rejected or failed");
    }
  };

  const handleDownload = async (material: Material) => {
    if (!account || !material.shelbyId) {
      alert("Please connect your wallet and ensure the file has been uploaded.");
      return;
    }

    setDownloading(material.id);
    try {
      // Create transaction first
      const txHash = await createDownloadTransaction(material.name);

      // Download from Shelby
      const downloadResult = await downloadFromShelby(
        material.shelbyId,
        account.address.toString(),
        txHash
      ) as ShelbyDownloadResult;

      // Create blob URL and trigger download
      const url = window.URL.createObjectURL(downloadResult.fileData);
      const a = document.createElement("a");
      a.href = url;
      a.download = material.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      alert(`File downloaded successfully!\nTransaction: ${downloadResult.txHash.slice(0, 20)}...`);
    } catch (error) {
      alert(`Download failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-950">
      <div className="px-4 md:px-8 pt-8 pb-8 max-w-[1200px] mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-4xl font-black tracking-tighter text-foreground">Downloads</h1>
          <p className="text-sm text-muted font-medium mt-1">Download your uploaded study materials to your device.</p>
        </div>

        {filesMaterials.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-muted border-2 border-dashed border-border rounded-[40px] bg-white/50 dark:bg-slate-900/50">
            <FolderIcon className="w-12 h-12 text-slate-200 dark:text-slate-800 mb-4" />
            <p className="text-lg font-black text-foreground mb-1">No files to download</p>
            <p className="text-xs text-center px-4 max-w-xs font-medium">Upload files to your Materials library to download them later.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filesMaterials.map((material) => (
              <div
                key={material.id}
                className="flex items-center justify-between p-5 bg-white dark:bg-slate-900 border border-border rounded-2xl hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
                    <FileIcon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-foreground truncate">{material.name}</p>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-muted">
                      <span className="uppercase font-black tracking-wider">{material.category}</span>
                      {material.txHash && (
                        <>
                          <span>•</span>
                          <span className="font-mono truncate" title={material.txHash}>
                            TX: {material.txHash.slice(0, 12)}...
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDownload(material)}
                  disabled={downloading === material.id || !account}
                  className="ml-4 flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                  title={!account ? "Connect wallet to download" : "Download file"}
                >
                  {downloading === material.id ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Download
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
