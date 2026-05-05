"use client";

import { Home, FolderOpen, FileText, Settings, Bell, X } from "lucide-react";
import ConnectWallet from "./ConnectWallet";
import { clsx } from "clsx";

interface SidebarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  activeCategory?: string;
  onCategoryChange?: (category: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ 
  activeTab = "home", 
  onTabChange = () => {},
  activeCategory = "all",
  onCategoryChange = () => {},
  isOpen = false,
  onClose = () => {}
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

      <div className={clsx(
        "fixed inset-y-0 left-0 z-50 w-72 bg-sidebar border-r border-slate-200 dark:border-slate-800 flex flex-col pt-6 pb-4 transition-transform duration-300 lg:relative lg:translate-x-0 lg:z-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="px-6 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <div className="w-5 h-5 bg-white rounded-md rotate-45" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">StudyBuddy</span>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
          <button 
            onClick={() => { onTabChange("home"); onClose(); }}
            className={clsx(
              "flex items-center gap-3 px-4 py-2.5 w-full text-left rounded-2xl transition-all font-medium",
              activeTab === "home" 
                ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400" 
                : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100"
            )}
          >
            <Home className="w-5 h-5" />
            <span>Home</span>
          </button>
          
          <div className="pt-2">
            <button 
              onClick={() => { onTabChange("materials"); onCategoryChange("all"); onClose(); }}
              className={clsx(
                "flex items-center gap-3 px-4 py-2.5 w-full text-left rounded-2xl transition-all font-medium",
                activeTab === "materials" 
                  ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400" 
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              )}
            >
              <FolderOpen className="w-5 h-5" />
              <span>Materials</span>
            </button>
            
            {activeTab === "materials" && (
              <div className="pl-12 pr-3 py-1 space-y-1 mt-1 border-l border-slate-100 dark:border-slate-800 ml-6">
                <button 
                  onClick={() => onCategoryChange("lectures")}
                  className={clsx(
                    "block w-full text-left text-sm py-1.5 transition-colors",
                    activeCategory === "lectures" ? "font-semibold text-blue-600 dark:text-blue-400" : "text-slate-400 hover:text-blue-500"
                  )}
                >
                  Lectures
                </button>
                <button 
                  onClick={() => onCategoryChange("notes")}
                  className={clsx(
                    "block w-full text-left text-sm py-1.5 transition-colors",
                    activeCategory === "notes" ? "font-semibold text-blue-600 dark:text-blue-400" : "text-slate-400 hover:text-blue-500"
                  )}
                >
                  Study Notes
                </button>
                <button 
                  onClick={() => onCategoryChange("assignments")}
                  className={clsx(
                    "block w-full text-left text-sm py-1.5 transition-colors",
                    activeCategory === "assignments" ? "font-semibold text-blue-600 dark:text-blue-400" : "text-slate-400 hover:text-blue-500"
                  )}
                >
                  Assignments
                </button>
                <button 
                  onClick={() => onCategoryChange("links")}
                  className={clsx(
                    "block w-full text-left text-sm py-1.5 transition-colors",
                    activeCategory === "links" ? "font-semibold text-blue-600 dark:text-blue-400" : "text-slate-400 hover:text-blue-500"
                  )}
                >
                  Links
                </button>
              </div>
            )}
          </div>


          <button 
            onClick={() => { onTabChange("notes"); onClose(); }}
            className={clsx(
              "flex items-center gap-3 px-4 py-2.5 w-full text-left rounded-2xl transition-all font-medium",
              activeTab === "notes" 
                ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400" 
                : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
            )}
          >
            <FileText className="w-5 h-5" />
            <span>Notes</span>
          </button>
          
          <button 
            onClick={() => { onTabChange("notifications"); onClose(); }}
            className={clsx(
              "flex items-center justify-between px-4 py-2.5 w-full text-left rounded-2xl transition-all font-medium",
              activeTab === "notifications" 
                ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400" 
                : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
            )}
          >
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5" />
              <span>Notifications</span>
            </div>
            <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">3</span>
          </button>
        </nav>

        <div className="px-4 space-y-1.5 mt-auto border-t border-slate-100 dark:border-slate-800 pt-6">
          <button 
            onClick={() => { onTabChange("settings"); onClose(); }}
            className={clsx(
              "flex items-center gap-3 px-4 py-2.5 w-full text-left rounded-2xl transition-all font-medium",
              activeTab === "settings" 
                ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400" 
                : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
            )}
          >
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </button>
        </div>

        <div className="px-4 mt-6">
          <ConnectWallet />
        </div>
      </div>
    </>
  );
}

