"use client";

import { Material } from "@/lib/materials";
import { File, Link as LinkIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MaterialCardProps {
  material: Material;
  onClick: () => void;
  isActive?: boolean;
}

export default function MaterialCard({ material, onClick, isActive }: MaterialCardProps) {
  const isFile = material.type === "file";
  
  return (
    <div 
      onClick={onClick}
      className={cn(
        "cursor-pointer rounded-2xl p-5 border transition-all duration-200 group flex flex-col h-40",
        isActive 
          ? "bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/20" 
          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:shadow-md text-slate-900 dark:text-slate-100"
      )}
    >
      <div className="flex justify-between items-start mb-auto">
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center",
          isActive ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-500/10 group-hover:text-blue-500"
        )}>
          {isFile ? <File className="w-5 h-5" /> : <LinkIcon className="w-5 h-5" />}
        </div>
      </div>
      
      <div>
        <h3 className="font-semibold text-lg line-clamp-1 mb-1">{material.name}</h3>
        <p className={cn(
          "text-sm line-clamp-1",
          isActive ? "text-blue-100" : "text-slate-500 dark:text-slate-400"
        )}>
          {isFile ? "File Document" : "Web Link"}
        </p>
      </div>
    </div>
  );
}
