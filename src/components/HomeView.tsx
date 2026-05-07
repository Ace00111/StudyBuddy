"use client";

import { Clock, MoreHorizontal, Zap, Shield, Globe, ArrowRight, Activity, BookOpen, GraduationCap, Sparkles, Play, Plus, MousePointer2 } from "lucide-react";
import { Material } from "@/lib/materials";
import { useState, useEffect } from "react";

function LegendItem({ color, label, value, perc }: { color: string, label: string, value: number, perc: number }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all">
      <div className={`w-2 h-2 rounded-full ${color} shadow-lg shadow-current`} />
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-black text-foreground uppercase tracking-widest">{label}</p>
        <p className="text-[9px] text-muted font-bold">{value} files • {Math.round(perc)}%</p>
      </div>
    </div>
  );
}

interface HomeViewProps {
  materials?: Material[];
  notesCount?: number;
  onExplore?: () => void;
}

export default function HomeView({ materials = [], notesCount = 0, onExplore }: HomeViewProps) {
  const [privacy, setPrivacy] = useState({ stealthMode: false, hideActivity: false });

  useEffect(() => {
    const checkPrivacy = () => {
      const saved = localStorage.getItem('studybuddy_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        setPrivacy(parsed.privacy || { stealthMode: false, hideActivity: false });
      }
    };
    checkPrivacy();
    window.addEventListener('studybuddy_settings_updated', checkPrivacy);
    return () => window.removeEventListener('studybuddy_settings_updated', checkPrivacy);
  }, []);

  const stats = {
    pdf: materials.filter(m => m.name.toLowerCase().endsWith(".pdf")).length,
    lectures: materials.filter(m => /\.(mp3|wav|m4a)$/i.test(m.name)).length,
    video: materials.filter(m => /\.(mp4|mov|avi)$/i.test(m.name)).length,
    images: materials.filter(m => /\.(png|jpg|jpeg|gif|svg)$/i.test(m.name)).length,
    others: materials.filter(m => m.type === "file" && !/\.(pdf|mp3|wav|m4a|mp4|mov|avi|png|jpg|jpeg|gif|svg)$/i.test(m.name)).length
  };

  const total = materials.length + notesCount || 1;
  const segments = [
    { color: '#22c55e', perc: (notesCount / total) * 100 },
    { color: '#3b82f6', perc: (stats.pdf / total) * 100 },
    { color: '#ec4899', perc: (stats.lectures / total) * 100 },
    { color: '#8b5cf6', perc: (stats.video / total) * 100 },
    { color: '#eab308', perc: (stats.images / total) * 100 },
    { color: '#64748b', perc: (stats.others / total) * 100 }
  ];

  let current = 0;
  const gradientParts = segments.map(s => {
    const start = current;
    current += s.perc;
    return `${s.color} ${start}% ${current}%`;
  }).join(", ");

  const totalSizeBytes = materials.reduce((acc, m) => acc + (m.size || 0), 0);
  const totalSizeMb = (totalSizeBytes / (1024 * 1024)).toFixed(2);

  return (
    <div className="flex-1 p-4 md:p-8 space-y-10 bg-slate-50 dark:bg-slate-950 min-h-full animate-in fade-in duration-1000">
      {/* Dark Premium Hero Section */}
      <div className="relative py-24 px-4 md:px-12 rounded-[50px] bg-[#0a0c14] text-white overflow-hidden text-center flex flex-col items-center justify-center shadow-2xl shadow-blue-900/20 group hover:shadow-primary/30 transition-shadow duration-700">
        <style jsx>{`
          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
          }
          .animate-float {
            animation: float 6s ease-in-out infinite;
          }
        `}</style>
        
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(79,70,229,0.2),transparent)]" />
        
        {/* Middle Decorative Cursor Icon */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none animate-in zoom-in duration-1000">
           <MousePointer2 className="w-96 h-96 text-primary rotate-[15deg] animate-pulse" />
        </div>
        
        <div className="relative z-10 space-y-8 max-w-3xl animate-float">
           <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-3 h-3 text-blue-400 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400">Welcome to Study Buddy</span>
           </div>
           
           <h1 className="text-4xl md:text-7xl font-black tracking-tighter leading-tight bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent drop-shadow-2xl">
              Instantly organize your library <br/> with decentralized AI
           </h1>
           
           <p className="text-sm md:text-xl opacity-60 font-medium max-w-2xl mx-auto leading-relaxed">
              Securely upload your study materials to create your personal <br className="hidden md:block"/> knowledge base on Secure Study Storage.
           </p>

           <div className="flex justify-center pt-8">
              <button 
                onClick={onExplore}
                className="px-12 py-5 bg-primary text-white font-black rounded-full hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-primary/40 flex items-center gap-4 text-base group/btn"
              >
                 Explore Now
                 <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
              </button>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Storage Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[50px] p-8 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:scale-150 transition-transform duration-1000" />
          
          <div className="flex justify-between items-start mb-8 relative z-10">
             <div>
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Library Overview</h3>
               <div className="flex items-baseline gap-2">
                 <span className="text-4xl font-black tracking-tighter text-foreground">{totalSizeMb} MB</span>
                 <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">Used</span>
               </div>
             </div>
             <button className="w-10 h-10 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-all border border-transparent hover:border-primary/20">
               <MoreHorizontal className="w-5 h-5" />
             </button>
          </div>

          <div className="flex flex-col xl:flex-row items-center gap-12 relative z-10">
             <div className="relative w-64 h-64 flex items-center justify-center">
               <div 
                 className="absolute inset-0 rounded-full shadow-2xl opacity-20 blur-2xl"
                 style={{ background: `conic-gradient(${gradientParts})` }}
               />
               <div 
                 className="w-full h-full rounded-full flex items-center justify-center p-8 transition-all duration-1000 group-hover:rotate-6"
                 style={{ background: `conic-gradient(${gradientParts})` }}
               >
                 <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center shadow-inner relative overflow-hidden">
                   <div className="text-center z-10">
                     <p className="text-5xl font-black text-foreground tracking-tighter">{materials.length}</p>
                     <p className="text-[10px] text-muted font-black uppercase tracking-[0.2em] mt-1">Files</p>
                   </div>
                 </div>
               </div>
             </div>

             <div className="flex-1 w-full grid grid-cols-2 gap-3">                <LegendItem color="bg-green-500" label="Notes" value={notesCount} perc={(notesCount/total)*100} />                <LegendItem color="bg-blue-500" label="Notes" value={stats.pdf} perc={(stats.pdf/total)*100} />
                <LegendItem color="bg-pink-500" label="Audio" value={stats.lectures} perc={(stats.lectures/total)*100} />
                <LegendItem color="bg-purple-500" label="Videos" value={stats.video} perc={(stats.video/total)*100} />
                <LegendItem color="bg-yellow-500" label="Captures" value={stats.images} perc={(stats.images/total)*100} />
                <LegendItem color="bg-slate-500" label="Others" value={stats.others} perc={(stats.others/total)*100} />
             </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="p-8 rounded-[40px] bg-white dark:bg-slate-900 border border-border shadow-sm">
             <div className="flex items-center justify-between mb-6">
               <h3 className="text-[10px] font-black uppercase tracking-widest text-muted">Recent Activity</h3>
               <Sparkles className="w-3 h-3 text-primary animate-pulse" />
             </div>
             <div className="space-y-3">
                {materials.length > 0 && !privacy.hideActivity ? (
                  materials.slice(-4).reverse().map((m, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all border border-transparent hover:border-border cursor-pointer group/node">
                       <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center group-hover/node:bg-primary/10 group-hover/node:text-primary transition-all">
                          <BookOpen className="w-4 h-4" />
                       </div>
                       <div className="flex-1 min-w-0">
                          <p className={`text-xs font-black truncate text-foreground ${privacy.stealthMode ? 'blur-sm select-none transition-all duration-500' : ''}`}>{m.name}</p>
                          <p className="text-[9px] font-bold text-muted uppercase tracking-tighter">{m.type} • Added</p>
                       </div>
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center">
                    <p className="text-[10px] text-muted font-black uppercase">
                      {privacy.hideActivity ? "Activity Hidden" : "No recent files"}
                    </p>
                  </div>
                )}
             </div>
          </div>

          <div className="p-8 rounded-[40px] bg-primary text-white shadow-xl shadow-primary/20 relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 blur-2xl group-hover:scale-150 transition-transform duration-700" />
             <div className="flex items-center gap-2 mb-3">
                <Shield className="w-3 h-3 opacity-60" />
                <h4 className="text-[10px] font-black uppercase tracking-widest">Privacy Tip</h4>
             </div>
             <p className="text-xs opacity-90 leading-relaxed font-bold">Your library is encrypted and only accessible via your decentralized wallet key.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
