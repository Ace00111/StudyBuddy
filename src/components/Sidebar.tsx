"use client";

import { Home, FolderOpen, FileText, Settings, Bell, X, ChevronLeft, ChevronRight, LayoutDashboard, BarChart3, Download } from "lucide-react";


import ConnectWallet from "./ConnectWallet";
import { clsx } from "clsx";

interface SidebarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  activeCategory?: string;
  onCategoryChange?: (category: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
  notificationCount?: number;
  minimized?: boolean;
  onToggleMinimize?: () => void;
}

export default function Sidebar({ 
  activeTab = "home", 
  onTabChange = () => {},
  activeCategory = "all",
  onCategoryChange = () => {},
  isOpen = false,
  onClose = () => {},
  notificationCount = 0,
  minimized = false,
  onToggleMinimize = () => {}
}: SidebarProps) {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden" 
          onClick={onClose}
        />
      )}

      <div 
        onMouseEnter={() => window.dispatchEvent(new Event('sidebar_hovered'))}
        onMouseLeave={() => window.dispatchEvent(new Event('sidebar_left'))}
        className={clsx(
        "fixed inset-y-0 left-0 z-50 bg-slate-950 border-r border-slate-800 flex flex-col pt-6 pb-4 transition-all duration-500 lg:relative lg:translate-x-0 lg:z-0 shadow-2xl lg:shadow-none h-screen max-h-screen",

        isOpen ? "translate-x-0" : "-translate-x-full",
        minimized ? "w-20" : "w-72"
      )}>
        {/* Toggle Button Removed as requested */}

        {/* Formal Logo Section */}
        <div className={clsx(
          "px-6 mb-12 flex items-center justify-between",
          minimized && "px-0 justify-center"
        )}>
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center shadow-2xl shadow-blue-500/40 shrink-0 relative overflow-hidden group/logo">
               <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover/logo:opacity-100 transition-opacity" />
               <div className="w-5 h-5 bg-white rounded-sm rotate-45 shadow-sm" />
            </div>
            {!minimized && <span className="font-bold text-xl tracking-tight text-white/90">StudyBuddy</span>}
          </div>

          <button 
            onClick={onClose}
            className="p-2 text-slate-500 hover:bg-slate-800 rounded-xl lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          <button 
            onClick={() => { onTabChange("home"); onClose(); }}
            title="Home"
            className={clsx(
              "flex items-center gap-3 px-4 py-3 w-full text-left rounded-2xl transition-all font-medium text-sm",
              minimized && "justify-center px-0",
              activeTab === "home" 
                ? "bg-blue-500/10 text-blue-400" 
                : "text-slate-400 hover:bg-slate-800/50"
            )}
          >
            <Home className="w-5 h-5 shrink-0" />
            {!minimized && <span>Home</span>}
          </button>
          
          <button 
            onClick={() => { onTabChange("materials"); onCategoryChange("all"); onClose(); }}
            title="Materials"
            className={clsx(
              "flex items-center gap-3 px-4 py-3 w-full text-left rounded-2xl transition-all font-medium text-sm",
              minimized && "justify-center px-0",
              activeTab === "materials" 
                ? "bg-blue-500/10 text-blue-400" 
                : "text-slate-400 hover:bg-slate-800/50"
            )}
          >
            <FolderOpen className="w-5 h-5 shrink-0" />
            {!minimized && <span>Materials</span>}
          </button>

          <button 
            onClick={() => { onTabChange("downloads"); onClose(); }}
            title="Downloads"
            className={clsx(
              "flex items-center gap-3 px-4 py-3 w-full text-left rounded-2xl transition-all font-medium text-sm",
              minimized && "justify-center px-0",
              activeTab === "downloads" 
                ? "bg-blue-500/10 text-blue-400" 
                : "text-slate-400 hover:bg-slate-800/50"
            )}
          >
            <Download className="w-5 h-5 shrink-0" />
            {!minimized && <span>Downloads</span>}
          </button>

          <button 
            onClick={() => { onTabChange("notes"); onClose(); }}
            title="Notes"
            className={clsx(
              "flex items-center gap-3 px-4 py-3 w-full text-left rounded-2xl transition-all font-medium text-sm",
              minimized && "justify-center px-0",
              activeTab === "notes" 
                ? "bg-blue-500/10 text-blue-400" 
                : "text-slate-400 hover:bg-slate-800/50"
            )}
          >
            <FileText className="w-5 h-5 shrink-0" />
            {!minimized && <span>Notes</span>}
          </button>

          <button 
            onClick={() => { onTabChange("stats"); onClose(); }}
            title="Library Stats"
            className={clsx(
              "flex items-center gap-3 px-4 py-3 w-full text-left rounded-2xl transition-all font-medium text-sm",
              minimized && "justify-center px-0",
              activeTab === "stats" 
                ? "bg-blue-500/10 text-blue-400" 
                : "text-slate-400 hover:bg-slate-800/50"
            )}
          >
            <BarChart3 className="w-5 h-5 shrink-0" />
            {!minimized && <span>Stats</span>}
          </button>
          
          <button 
            onClick={() => { onTabChange("notifications"); onClose(); }}
            title="Notifications"
            className={clsx(
              "flex items-center justify-between px-4 py-3 w-full text-left rounded-2xl transition-all font-medium text-sm",
              minimized && "justify-center px-0",
              activeTab === "notifications" 
                ? "bg-blue-500/10 text-blue-400" 
                : "text-slate-400 hover:bg-slate-800/50"
            )}
          >
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 shrink-0" />
              {!minimized && <span>Notifications</span>}
            </div>
            {!minimized && notificationCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {notificationCount}
              </span>
            )}
          </button>
        </nav>

        {/* Bottom Section for Settings and Wallet */}
        <div className="px-4 pb-4 mt-auto space-y-2">
          <button 
            onClick={() => { onTabChange("settings"); onClose(); }}
            title="Settings"
            className={clsx(
              "flex items-center gap-3 px-4 py-3 w-full text-left rounded-2xl transition-all font-medium text-sm",
              minimized && "justify-center px-0",
              activeTab === "settings" 
                ? "bg-blue-500/10 text-blue-400" 
                : "text-slate-400 hover:bg-slate-800/50"
            )}
          >
            <Settings className="w-5 h-5 shrink-0" />
            {!minimized && <span>Settings</span>}
          </button>

          <div className={clsx(minimized && "px-1")}>
            <ConnectWallet minimized={minimized} />
          </div>
        </div>



      </div>
    </>
  );
}
