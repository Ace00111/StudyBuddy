"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import InfoPane from "@/components/InfoPane";
import HomeView from "@/components/HomeView";
import MaterialsView from "@/components/MaterialsView";
import SettingsView from "@/components/SettingsView";
import NotesView from "@/components/NotesView";
import NotificationsView from "@/components/NotificationsView";
import { Material } from "@/lib/materials";
import { useTheme } from "next-themes";
import { Moon, Sun, Sidebar as SidebarIcon, Menu } from "lucide-react";

export default function Home() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [activeMaterial, setActiveMaterial] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("home");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [isInfoPaneOpen, setIsInfoPaneOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const handleUpload = (newMaterial: Material) => {
    setMaterials(prev => [...prev, newMaterial]);
  };

  const handleDeleteMaterial = (id: string) => {
    if (confirm("Are you sure you want to delete this material?")) {
      setMaterials(prev => prev.filter(m => m.id !== id));
    }
  };

  return (
    <div className="flex h-screen transition-colors duration-300 overflow-hidden text-slate-900 dark:text-slate-100">
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <main className="flex-1 flex flex-col h-screen overflow-y-auto relative">
        {/* Top Header */}
        <div className="sticky top-0 z-30 bg-header/80 backdrop-blur-md flex items-center justify-between px-4 md:px-8 py-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl lg:hidden"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-3 text-sm text-muted font-medium">
              <span className="hidden sm:inline hover:text-foreground cursor-pointer">StudyBuddy</span>
              <span className="hidden sm:inline">/</span>
              <span className="text-foreground font-bold uppercase tracking-wider text-[10px] bg-card px-2 py-1 rounded-md border border-border">
                {activeTab} {activeCategory !== "all" && `/ ${activeCategory}`}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            <button 
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all border border-border bg-card shadow-sm"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            
            <button 
              onClick={() => setIsInfoPaneOpen(!isInfoPaneOpen)}
              className={`p-2 rounded-xl transition-all border shadow-sm ${
                isInfoPaneOpen 
                  ? "text-primary bg-primary/10 border-primary/20" 
                  : "text-foreground bg-card border-border hover:bg-slate-100 dark:hover:bg-slate-800"
              } hidden md:flex`}
              aria-label="Toggle info pane"
            >
              <SidebarIcon className="w-5 h-5" />
            </button>

            <div className="hidden sm:flex items-center gap-2 text-sm text-foreground font-bold cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 bg-card border border-border px-4 py-2 rounded-xl transition-all shadow-sm">
              Manage
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {activeTab === "home" && <HomeView materials={materials} />}
          {activeTab === "materials" && (
            <MaterialsView 
              materials={materials} 
              onUpload={handleUpload} 
              onDelete={handleDeleteMaterial}
              activeMaterial={activeMaterial}
              setActiveMaterial={setActiveMaterial}
              selectedCategory={activeCategory}
            />
          )}
          {activeTab === "settings" && <SettingsView />}
          {activeTab === "notes" && <NotesView />}
          {activeTab === "notifications" && <NotificationsView />}
        </div>
      </main>

      {isInfoPaneOpen && (
        <div className="fixed inset-y-0 right-0 z-40 w-80 bg-white dark:bg-slate-950 lg:relative lg:translate-x-0 transition-transform duration-300">
          <InfoPane 
            materials={materials} 
            onClose={() => setIsInfoPaneOpen(false)} 
          />
        </div>
      )}
    </div>
  );
}



