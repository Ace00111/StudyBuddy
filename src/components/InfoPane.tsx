"use client";

import { MoreHorizontal, Pin, Activity } from "lucide-react";
import { Material } from "@/lib/materials";

export default function InfoPane({ materials }: { materials: Material[] }) {
  const fileCount = materials.filter(m => m.type === "file").length;
  const linkCount = materials.filter(m => m.type === "link").length;
  
  // Fake sizes for demo
  const docSize = (fileCount * 4.2).toFixed(1);
  const totalFiles = fileCount + linkCount;

  return (
    <div className="w-80 h-screen border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col pt-6 px-6 pb-4">
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-semibold text-lg">Info</h2>
        <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4 mb-8">
        <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-800/50">
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Documents</span>
            <MoreHorizontal className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold mb-3">{docSize} MB</div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
            <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: "45%" }}></div>
          </div>
        </div>

        <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-800/50">
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Links & Web</span>
            <MoreHorizontal className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold mb-3">{linkCount} items</div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
            <div className="bg-red-500 h-1.5 rounded-full" style={{ width: "20%" }}></div>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="font-semibold mb-4">Properties</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">Total Items</span>
            <span className="font-medium">{totalFiles}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">Created</span>
            <span className="font-medium">Today</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">Last modification</span>
            <span className="font-medium">Just now</span>
          </div>
        </div>
      </div>

      <div className="mb-auto">
        <h3 className="font-semibold mb-4">Tags</h3>
        <div className="flex flex-wrap gap-2">
          <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Physics
          </span>
          <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span> Math
          </span>
          <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Reading
          </span>
        </div>
      </div>

      <div className="space-y-1">
        <button className="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors w-full text-left">
          <Pin className="w-4 h-4" />
          <span className="font-medium text-sm">Pinned items</span>
        </button>
        <button className="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors w-full text-left">
          <Activity className="w-4 h-4" />
          <span className="font-medium text-sm">Activity</span>
        </button>
      </div>
    </div>
  );
}
