"use client";

import { Home, FolderOpen, FileText, BarChart2, Settings, Bell } from "lucide-react";
import ConnectWallet from "./ConnectWallet";

export default function Sidebar() {
  return (
    <div className="w-64 h-screen border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col pt-6 pb-4">
      <div className="px-6 mb-8 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
          <div className="w-4 h-4 bg-white rounded-sm rotate-45" />
        </div>
        <span className="font-bold text-xl tracking-tight">StudyBuddy</span>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        <a href="#" className="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
          <Home className="w-5 h-5" />
          <span className="font-medium">Home</span>
        </a>
        
        <div className="pt-4 pb-2">
          <a href="#" className="flex items-center gap-3 px-3 py-2 text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 rounded-lg font-medium">
            <FolderOpen className="w-5 h-5 text-blue-500" />
            <span>Materials</span>
          </a>
          <div className="pl-11 pr-3 py-2 space-y-2 mt-1">
            <a href="#" className="block text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">Lectures</a>
            <a href="#" className="block text-sm font-medium text-slate-900 dark:text-slate-100">Study Notes</a>
            <a href="#" className="block text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">Assignments</a>
          </div>
        </div>

        <a href="#" className="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
          <FileText className="w-5 h-5" />
          <span className="font-medium">Notes</span>
        </a>
        <a href="#" className="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
          <BarChart2 className="w-5 h-5" />
          <span className="font-medium">Reports</span>
        </a>
      </nav>

      <div className="px-4 space-y-1 mt-auto">
        <a href="#" className="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
          <Settings className="w-5 h-5" />
          <span className="font-medium">Settings</span>
        </a>
        <a href="#" className="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors justify-between">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5" />
            <span className="font-medium">Notifications</span>
          </div>
          <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">3</span>
        </a>
      </div>

      <div className="px-4 mt-6">
        <ConnectWallet />
      </div>
    </div>
  );
}
