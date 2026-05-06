"use client";

import { Material } from "@/lib/materials";
import { File, Link as LinkIcon, X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface MaterialCardProps {
  material: Material;
  onClick: () => void;
  isActive?: boolean;
}

export default function MaterialCard({ material, onClick, isActive }: MaterialCardProps) {
  const isFile = material.type === "file";
  
  const handleAddTag = (e: React.MouseEvent) => {
    e.stopPropagation();
    const tag = prompt("Enter a tag name:");
    if (tag && (window as any).updateMaterialTags) {
      (window as any).updateMaterialTags(material.id, tag);
    }
  };

  return (
    <div 
      onClick={onClick}
      className={cn(
        "cursor-pointer rounded-3xl p-5 border transition-all duration-300 group flex flex-col h-48 relative overflow-hidden",
        isActive 
          ? "bg-primary border-primary text-white shadow-2xl shadow-blue-500/20" 
          : "bg-card border-border hover:shadow-xl text-foreground"
      )}
    >
      <div className="flex justify-between items-start mb-4">
        <div className={cn(
          "w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm transition-all",
          isActive ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-primary/10 group-hover:text-primary"
        )}>
          {isFile ? <File className="w-6 h-6" /> : <LinkIcon className="w-6 h-6" />}
        </div>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {!isActive && (
             <>
               <button 
                 onClick={handleAddTag}
                 className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
                 title="Add Tag"
               >
                 <Plus className="w-4 h-4" />
               </button>
               <button 
                 onClick={(e) => { e.stopPropagation(); (window as any).deleteMaterial?.(material.id); }}
                 className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
                 title="Delete"
               >
                 <X className="w-4 h-4" />
               </button>
             </>
          )}
        </div>
      </div>
      
      <div className="flex-1">
        <h3 className="font-bold text-lg line-clamp-1 mb-1 tracking-tight">{material.name}</h3>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {material.tags?.map((tag, i) => (
            <span key={i} className={cn(
              "px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider",
              isActive ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
            )}>
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-auto">
        <p className={cn(
          "text-xs font-bold uppercase tracking-widest",
          isActive ? "text-blue-100/60" : "text-muted"
        )}>
          {isFile ? "Shelby Document" : "Network Link"}
        </p>
      </div>
    </div>
  );
}
