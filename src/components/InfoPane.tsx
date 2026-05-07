"use client";

import { X, Search, FileText, Activity, Zap, Music, Video, Image as ImageIcon, Box, Shield } from "lucide-react";
import { Material } from "@/lib/materials";
import { useState, useMemo } from "react";

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


  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return materials
      .filter(m => 
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => {
        // Prioritize exact name matches
        const aNameMatch = a.name.toLowerCase().startsWith(searchQuery.toLowerCase());
        const bNameMatch = b.name.toLowerCase().startsWith(searchQuery.toLowerCase());
        if (aNameMatch && !bNameMatch) return -1;
        if (!aNameMatch && bNameMatch) return 1;
        return 0;
      })
      .slice(0, 15);
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


           {/* Quick Stats — per-type breakdown */}
           <div className="p-5 bg-slate-50 dark:bg-slate-900 border border-border rounded-[32px] space-y-3">
              <p className="text-[9px] font-black uppercase tracking-widest text-muted mb-3">Quick Stats</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "PDFs", value: materials.filter(m => m.name.toLowerCase().endsWith(".pdf")).length, color: "text-blue-500", bg: "bg-blue-500/10" },
                  { label: "Audio", value: materials.filter(m => /\.(mp3|wav|m4a)$/i.test(m.name)).length, color: "text-pink-500", bg: "bg-pink-500/10" },
                  { label: "Videos", value: materials.filter(m => /\.(mp4|mov|avi)$/i.test(m.name)).length, color: "text-purple-500", bg: "bg-purple-500/10" },
                  { label: "Images", value: materials.filter(m => /\.(png|jpg|jpeg|gif|svg)$/i.test(m.name)).length, color: "text-yellow-500", bg: "bg-yellow-500/10" },
                ].map((stat) => (
                  <div key={stat.label} className={`p-3 rounded-2xl ${stat.bg} flex flex-col gap-1`}>
                    <span className={`text-xl font-black tracking-tighter ${stat.color}`}>{stat.value}</span>
                    <span className="text-[8px] font-black uppercase tracking-widest text-muted">{stat.label}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[8px] font-black uppercase tracking-widest text-muted">Links saved</span>
                <span className="text-[10px] font-black text-foreground">{materials.filter(m => m.type === "link").length}</span>
              </div>
           </div>
        </div>

        {/* Breakdown */}
        <div className="space-y-5">
          <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-muted">File Breakdown</h3>
          <div className="space-y-4">
            {(() => {
              const counts = [
                { icon: <FileText className="w-3 h-3" />, label: "PDFs", count: materials.filter(m => m.name.toLowerCase().endsWith(".pdf")).length, color: "bg-blue-500" },
                { icon: <Music className="w-3 h-3" />, label: "Audio", count: materials.filter(m => /\.(mp3|wav|m4a)$/i.test(m.name)).length, color: "bg-pink-500" },
                { icon: <Video className="w-3 h-3" />, label: "Videos", count: materials.filter(m => /\.(mp4|mov|avi)$/i.test(m.name)).length, color: "bg-purple-500" },
                { icon: <ImageIcon className="w-3 h-3" />, label: "Images", count: materials.filter(m => /\.(png|jpg|jpeg|gif|svg)$/i.test(m.name)).length, color: "bg-yellow-500" },
                { icon: <Box className="w-3 h-3" />, label: "Other", count: materials.filter(m => m.type === "file" && !/\.(pdf|mp3|wav|m4a|mp4|mov|avi|png|jpg|jpeg|gif|svg)$/i.test(m.name)).length, color: "bg-slate-500" },
              ];
              const maxCount = Math.max(1, ...counts.map(c => c.count));
              return counts.map(item => (
                <BreakdownItem key={item.label} icon={item.icon} label={item.label} count={item.count} maxCount={maxCount} color={item.color} />
              ));
            })()}
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
            This triggers a wallet signature to verify your decentralized storage hash on-chain.
          </p>
        </div>
      </div>
    </div>
  );
}

function BreakdownItem({ icon, label, count, maxCount, color }: { icon: any, label: string, count: number, maxCount: number, color: string }) {
  const percentage = Math.min(100, (count / maxCount) * 100);
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-[10px] font-black">
        <div className="flex items-center gap-2 text-foreground">
          <div className={`p-1 rounded-md ${color} bg-opacity-10 text-current`}>{icon}</div>
          {label}
        </div>
        <span className="text-muted">{count} files</span>
      </div>
      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1 overflow-hidden">
        <div className={`${color} h-full rounded-full transition-all duration-700`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
}

