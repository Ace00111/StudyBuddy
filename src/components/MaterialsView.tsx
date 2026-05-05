"use client";

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
  
  // Expose delete to window for the child cards to call (hacky but effective for deep components)
  useEffect(() => {
    (window as any).deleteMaterial = onDelete;
    return () => { delete (window as any).deleteMaterial; };
  }, [onDelete]);

  const openMaterial = (m: Material) => {
    setActiveMaterial(m.id);
    if (m.type === "file" && m.shelbyId) {
      window.open(getShelbyFileUrl(m.shelbyId), "_blank");
    }
    if (m.type === "link" && m.url) {
      window.open(m.url, "_blank");
    }
  };

  const filteredMaterials = selectedCategory === "all" 
    ? materials 
    : materials.filter(m => m.category === selectedCategory);

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="px-4 md:px-8 pb-8 pt-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <h1 className="text-3xl font-bold tracking-tight capitalize">
            {selectedCategory === "all" ? "Study Materials" : selectedCategory}
          </h1>
          
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search"
              className="pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <UploadBox 
          onUpload={onUpload} 
          defaultCategory={selectedCategory === "all" ? "lectures" : selectedCategory as any} 
        />

        {filteredMaterials.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
            <FolderIcon className="w-16 h-16 text-slate-300 dark:text-slate-700 mb-4" />
            <p className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-1">No {selectedCategory !== "all" ? selectedCategory : "materials"} yet</p>
            <p className="text-sm text-center px-4">Upload a file or add a link to this section to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
  );
}

