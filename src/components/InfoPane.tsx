"use client";

import { X, Search, FileText, Activity, Zap, Plus, Music, Video, Image as ImageIcon, Box, Globe, Shield, Book, Library, FileCheck } from "lucide-react";
import { Material } from "@/lib/materials";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";

interface InfoPaneProps {
  materials: Material[];
  notesCount: number;
  onClose: () => void;
}

export default function InfoPane({ materials, notesCount, onClose }: InfoPaneProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);

  const totalSizeBytes = materials.reduce((acc, m) => acc + (m.size || 0), 0);
  const totalSizeMb = (totalSizeBytes / (1024 * 1024)).toFixed(2);

  const getTypeSize = (regex: RegExp) => {
    const bytes = materials
      .filter(m => regex.test(m.name))
      .reduce((acc, m) => acc + (m.size || 0), 0);
    return (bytes / (1024 * 1024)).toFixed(2);
  };

  const pdfSize = getTypeSize(/\.pdf$/i);
  const audioSize = getTypeSize(/\.(mp3|wav|m4a)$/i);
  const videoSize = getTypeSize(/\.(mp4|mov|avi)$/i);
  const imageSize = getTypeSize(/\.(png|jpg|jpeg|gif|svg)$/i);
  const othersSize = (parseFloat(totalSizeMb) - (parseFloat(pdfSize) + parseFloat(audioSize) + parseFloat(videoSize) + parseFloat(imageSize))).toFixed(2);

  const CAPACITY_MB = 100;
  const capacityPercentage = Math.min(100, (parseFloat(totalSizeMb) / CAPACITY_MB) * 100);

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return materials.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 10);
  }, [materials, searchQuery]);

  const handleSync = async () => {
    setIsSyncing(true);
    if ((window as any).triggerLibrarySync) {
      await (window as any).triggerLibrarySync();
    }
    setIsSyncing(false);
  };

  return (
    <div 
      onMouseEnter={() => window.dispatchEvent(new Event('reset_infopane_timer'))}
      onMouseLeave={() => window.dispatchEvent(new Event('restart_infopane_timer'))}
      className="w-80 h-screen border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col relative overflow-hidden animate-in slide-in-from-right duration-500"
    >
      <div className="p-6 flex items-center justify-between shrink-0">
        <div>
          <h2 className="font-black text-xl tracking-tighter text-foreground">Library Stats</h2>
          <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mt-1">Wallet Verification</p>
        </div>
        <button 
          onClick={onClose}
          className="text-slate-400 hover:text-foreground p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-8 custom-scrollbar space-y-8">
        {/* Search & Functional Results */}
        <div className="space-y-3 relative">
          <div className="relative group z-20">
            <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-border rounded-2xl text-xs font-bold outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
            />
          </div>
          
          {searchQuery && (
            <div className="absolute top-full left-0 right-0 mt-2 p-3 bg-white dark:bg-slate-900 border border-border rounded-2xl shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-300 max-h-60 overflow-y-auto custom-scrollbar">
               {filteredItems.length > 0 ? (
                 <div className="space-y-1">
                   <p className="text-[8px] font-black uppercase text-muted tracking-widest mb-2 px-1">Found {filteredItems.length} items</p>
                   {filteredItems.map((item, i) => (
                     <div key={i} className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer group">
                        <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg group-hover:bg-primary/10 transition-colors">
                          <FileText className="w-3 h-3 text-muted group-hover:text-primary" />
                        </div>
                        <span className="text-[10px] font-black truncate flex-1 text-foreground">{item.name}</span>
                     </div>
                   ))}
                 </div>
               ) : (
                 <p className="text-[9px] font-bold text-muted text-center py-4">No matching materials found</p>
               )}
            </div>
          )}
        </div>

        {/* Global Overview */}
        <div className="space-y-4">
           <div className="grid grid-cols-2 gap-3">
              <div className="p-5 bg-[#0a0c14] text-white rounded-[32px] shadow-xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-16 h-16 bg-primary/20 rounded-full -mr-8 -mt-8 blur-xl" />
                 <p className="text-2xl font-black tracking-tighter mb-1">{materials.length}</p>
                 <p className="text-[8px] font-black uppercase text-muted tracking-widest">Total Files</p>
              </div>
              <div className="p-5 bg-primary text-white rounded-[32px] shadow-xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-16 h-16 bg-white/20 rounded-full -mr-8 -mt-8 blur-xl" />
                 <p className="text-2xl font-black tracking-tighter mb-1">{notesCount}</p>
                 <p className="text-[8px] font-black uppercase text-white/60 tracking-widest">Study Notes</p>
              </div>
           </div>

           <div className="p-6 bg-slate-50 dark:bg-slate-900 border border-border rounded-[32px]">
              <div className="flex justify-between items-center mb-2">
                 <p className="text-[9px] font-black uppercase tracking-widest text-muted">Library Capacity</p>
                 <span className="text-[10px] font-black text-primary">{totalSizeMb} / {CAPACITY_MB} MB</span>
              </div>
              <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                 <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: `${capacityPercentage}%` }}
                   transition={{ duration: 1, ease: "easeOut" }}
                   className="h-full bg-primary rounded-full shadow-[0_0_12px_rgba(59,130,246,0.6)]" 
                 />
              </div>
              <p className="text-[8px] font-black text-muted mt-2 uppercase tracking-widest">
                {100 - Math.round(capacityPercentage)}% Space Remaining
              </p>
           </div>
        </div>

        {/* Breakdown */}
        <div className="space-y-5">
          <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-muted">Categories</h3>
          <div className="space-y-4">
            <BreakdownItem icon={<FileText className="w-3 h-3" />} label="Notes" value={pdfSize} color="bg-blue-500" total={totalSizeMb} />
            <BreakdownItem icon={<Music className="w-3 h-3" />} label="Audio" value={audioSize} color="bg-pink-500" total={totalSizeMb} />
            <BreakdownItem icon={<Video className="w-3 h-3" />} label="Videos" value={videoSize} color="bg-purple-500" total={totalSizeMb} />
            <BreakdownItem icon={<ImageIcon className="w-3 h-3" />} label="Captures" value={imageSize} color="bg-yellow-500" total={totalSizeMb} />
            <BreakdownItem icon={<Box className="w-3 h-3" />} label="Other" value={othersSize} color="bg-slate-500" total={totalSizeMb} />
          </div>
        </div>

        {/* Wallet Confirmation Area */}
        <div className="pt-6 border-t border-border space-y-4">
          <div className="flex items-center gap-3 mb-2">
             <Shield className="w-4 h-4 text-green-500" />
             <span className="text-[10px] font-black uppercase tracking-widest">Sign Transaction Sync</span>
          </div>
          <button 
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center justify-between w-full p-5 bg-[#0a0c14] text-white rounded-[24px] group hover:scale-[1.02] transition-all disabled:opacity-50 shadow-xl border border-white/5"
          >
            <div className="flex items-center gap-3">
               <Activity className={`w-4 h-4 text-primary ${isSyncing ? 'animate-spin' : ''}`} />
               <span className="font-black text-[10px] uppercase tracking-widest">
                 {isSyncing ? 'Confirming...' : 'Sign & Sync'}
               </span>
            </div>
            <Zap className={`w-3 h-3 text-primary ${isSyncing ? 'animate-bounce' : 'animate-pulse'}`} />
          </button>
          <p className="text-[8px] font-bold text-muted text-center px-4 leading-relaxed">
            Note: This will trigger a wallet signature request to verify your decentralized storage hash.
          </p>
        </div>
      </div>
    </div>
  );
}

function BreakdownItem({ icon, label, value, color, total }: { icon: any, label: string, value: string, color: string, total: string }) {
  const percentage = Math.min(100, (parseFloat(value) / Math.max(1, parseFloat(total))) * 100);
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-[10px] font-black">
        <div className="flex items-center gap-2 text-foreground">
          <div className={`p-1 rounded-md ${color} bg-opacity-10 text-current`}>{icon}</div>
          {label}
        </div>
        <span className="text-muted">{value} MB</span>
      </div>
      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1 overflow-hidden">
        <div className={`${color} h-full rounded-full transition-all duration-1000`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
}
