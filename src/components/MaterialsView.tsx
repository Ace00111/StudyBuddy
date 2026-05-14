"use client";

import { useEffect, useState } from "react";
import { Search, Folder as FolderIcon } from "lucide-react";
import UploadBox from "@/components/UploadBox";
import MaterialCard from "@/components/MaterialCard";
import { Material } from "@/lib/materials";
import { getShelbyFileUrl } from "@/lib/shelby";

interface MaterialsViewProps {
  materials: Material[];
  onUpload: (newMaterial: Material) => void;
  onDelete: (id: string) => void;
  activeMaterial: string | null;
  setActiveMaterial: (id: string | null) => void;
  selectedCategory?: string;
}

export default function MaterialsView({ 
  materials, 
  onUpload, 
  onDelete,
  activeMaterial, 
  setActiveMaterial,
  selectedCategory = "all"
}: MaterialsViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  
  useEffect(() => {
    (window as any).deleteMaterial = onDelete;
    return () => { delete (window as any).deleteMaterial; };
  }, [onDelete]);

  const openMaterial = (m: Material) => {
    setActiveMaterial(m.id);
    if (m.type === "file" && m.shelbyId) {
      window.open(getShelbyFileUrl(m.shelbyId), "_blank");
    }
  };

  const filteredMaterials = materials
    .filter(m => (selectedCategory === "all" || m.category === selectedCategory))
    .filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="flex-1 flex flex-col h-full bg-background">
      <div className="px-4 md:px-8 pb-8 pt-8 max-w-[1600px] mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-4xl font-black tracking-tighter capitalize text-white">
              {selectedCategory === "all" ? "Study Materials" : selectedCategory}
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-1">Manage and access your decentralized school library.</p>
          </div>
          
          <div className="relative group">
            <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search library..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-3 bg-card border border-slate-800 rounded-2xl text-xs font-bold w-full md:w-72 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-white"
            />
          </div>
        </div>

        <UploadBox 
          onUpload={onUpload} 
          defaultCategory={selectedCategory === "all" ? "lectures" : selectedCategory as any} 
        />

        <div className="mt-10">
          {filteredMaterials.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-500 border-2 border-dashed border-slate-800 rounded-[40px] bg-card/50">
              <FolderIcon className="w-12 h-12 text-slate-800 mb-4" />
              <p className="text-lg font-black text-white mb-1">Library is empty</p>
              <p className="text-xs text-center px-4 max-w-xs font-medium">Upload your first study material to get started with your decentralized library.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {filteredMaterials.map((m) => (
                <MaterialCard 
                  key={m.id} 
                  material={m} 
                  isActive={activeMaterial === m.id}
                  onClick={() => openMaterial(m)} 
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>

  );
}
