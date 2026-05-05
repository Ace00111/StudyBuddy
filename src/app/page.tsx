"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import InfoPane from "@/components/InfoPane";
import UploadBox from "@/components/UploadBox";
import MaterialCard from "@/components/MaterialCard";
import { Material } from "@/lib/materials";
import { getShelbyFileUrl } from "@/lib/shelby";
import { Search, Filter, Folder as FolderIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export default function Home() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [activeMaterial, setActiveMaterial] = useState<string | null>(null);
  const { theme, setTheme } = useTheme();

  const handleUpload = (newMaterial: Material) => {
    setMaterials(prev => [...prev, newMaterial]);
  };

  const openMaterial = (m: Material) => {
    setActiveMaterial(m.id);
    if (m.type === "file" && m.shelbyId) {
      window.open(getShelbyFileUrl(m.shelbyId), "_blank");
    }
    if (m.type === "link" && m.url) {
      window.open(m.url, "_blank");
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar />

      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        <div className="flex items-center justify-between px-8 py-6">
          <div className="flex items-center gap-3 text-sm text-slate-500 font-medium">
            <span className="hover:text-slate-900 cursor-pointer">Projects</span>
            <span>/</span>
            <span className="text-slate-900 dark:text-slate-100 font-semibold">Ikigai Labs</span>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 font-medium cursor-pointer hover:text-slate-900 dark:hover:text-slate-100">
              <Filter className="w-4 h-4" />
              Manage
            </div>
          </div>
        </div>

        <div className="px-8 pb-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Study Materials</h1>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search"
                  className="pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors">
                <Filter className="w-4 h-4" />
                Filter
              </button>
            </div>
          </div>

          <UploadBox onUpload={handleUpload} />

          {materials.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              <FolderIcon className="w-16 h-16 text-slate-300 dark:text-slate-700 mb-4" />
              <p className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-1">No materials yet</p>
              <p className="text-sm">Upload a file or add a link to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {materials.map((m) => (
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
      </main>

      <InfoPane materials={materials} />
    </div>
  );
}
