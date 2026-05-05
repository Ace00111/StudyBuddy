"use client";

import { Clock } from "lucide-react";
import { Material } from "@/lib/materials";

interface HomeViewProps {
  materials?: Material[];
}

export default function HomeView({ materials = [] }: HomeViewProps) {
  const stats = {
    pdf: materials.filter(m => m.name.toLowerCase().endsWith('.pdf')).length,
    audio: materials.filter(m => /\.(mp3|wav|m4a)$/i.test(m.name)).length,
    video: materials.filter(m => /\.(mp4|mov|avi)$/i.test(m.name)).length,
    links: materials.filter(m => m.type === 'link').length,
    others: materials.filter(m => m.type === 'file' && !/\.(pdf|mp3|wav|m4a|mp4|mov|avi)$/i.test(m.name)).length,
  };

  const total = materials.length || 1;
  
  return (
    <div className="flex-1 flex flex-col h-full bg-background transition-colors">
      <div className="px-8 pt-8 pb-4">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400">Welcome back. Here is your study system overview.</p>
      </div>

      <div className="px-4 md:px-8 pb-8 space-y-6">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-card border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">Recent Activity</h3>
              <button className="text-sm text-blue-500 font-medium hover:text-blue-600">View All</button>
            </div>
            <div className="space-y-4">
              {materials.length > 0 ? (
                materials.slice(-3).reverse().map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl transition-colors cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{item.name}</p>
                      <p className="text-xs text-slate-500 capitalize">{item.type} • {item.category}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-slate-400 text-sm">No activity yet</div>
              )}
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-card border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center">
            <h3 className="text-lg font-bold mb-6 self-start">Storage Distribution</h3>
            <div className="flex-1 flex items-center justify-center py-4">
               <div className="w-40 h-40 md:w-48 md:h-48 rounded-full border-[12px] md:border-[16px] border-slate-100 dark:border-slate-800 relative flex items-center justify-center">
                 <div className="absolute inset-0 rounded-full border-[12px] md:border-[16px] border-blue-500" style={{ clipPath: `polygon(50% 50%, 50% 0, 100% 0, 100% ${Math.min(100, (stats.pdf / total) * 100 + 50)}%, 50% 50%)` }}></div>
                 <div className="absolute inset-0 rounded-full border-[12px] md:border-[16px] border-purple-500" style={{ clipPath: `polygon(50% 50%, 0 100%, 0 0, 50% 0)` }}></div>
                 <div className="text-center">
                   <p className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">{materials.length}</p>
                   <p className="text-[10px] md:text-xs text-slate-500 font-medium uppercase tracking-wider">Items</p>
                 </div>
               </div>
            </div>
            <div className="grid grid-cols-3 gap-4 md:gap-6 mt-6 w-full px-4">
              <div className="flex items-center gap-2 text-[10px] md:text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span> PDF ({stats.pdf})
              </div>
              <div className="flex items-center gap-2 text-[10px] md:text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span> Audio ({stats.audio})
              </div>
              <div className="flex items-center gap-2 text-[10px] md:text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-red-500"></span> Video ({stats.video})
              </div>
              <div className="flex items-center gap-2 text-[10px] md:text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-green-500"></span> Links ({stats.links})
              </div>
              <div className="flex items-center gap-2 text-[10px] md:text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-slate-400"></span> Other ({stats.others})
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

