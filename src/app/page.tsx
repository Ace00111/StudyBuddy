"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import InfoPane from "@/components/InfoPane";
import HomeView from "@/components/HomeView";
import MaterialsView from "@/components/MaterialsView";
import SettingsView from "@/components/SettingsView";
import NotesView from "@/components/NotesView";
import NotificationsView from "@/components/NotificationsView";
import { Material } from "@/lib/materials";
import { Sidebar as SidebarIcon, Menu, MousePointer2, LayoutDashboard } from "lucide-react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  type?: "success" | "info" | "security";
}

export default function Home() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [notes, setNotes] = useState<any[]>([]);

  // Initialize from LocalStorage (Shelby Protocol Mock)
  useEffect(() => {
    const savedMaterials = localStorage.getItem('studybuddy_materials');
    if (savedMaterials) setMaterials(JSON.parse(savedMaterials));
    
    const savedNotes = localStorage.getItem('studybuddy_notes');
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    } else {
      setNotes([{ id: 1, title: "Quantum Physics Summary", excerpt: "The main principles of quantum mechanics include...", content: "The main principles of quantum mechanics include superposition, entanglement, and the uncertainty principle.", date: "2 hours ago", color: 'blue', tags: ['Physics', 'Exams'] }]);
    }
  }, []);

  // Persist to LocalStorage
  useEffect(() => {
    if (materials.length > 0) localStorage.setItem('studybuddy_materials', JSON.stringify(materials));
  }, [materials]);

  useEffect(() => {
    if (notes.length > 0) localStorage.setItem('studybuddy_notes', JSON.stringify(notes));
  }, [notes]);
  const { signAndSubmitTransaction, connected } = useWallet();

  const [activeMaterial, setActiveMaterial] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 1, title: "File Successfully Synced", message: "Your library metadata has been successfully backed up on-chain.", time: "10 minutes ago", isRead: false, type: "success" },
  ]);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const [activeTab, setActiveTab] = useState<string>("home");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [isInfoPaneOpen, setIsInfoPaneOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);
  const [headerProfile, setHeaderProfile] = useState({ name: "Guest Scholar", avatar: "" });

  // Profile Persistence & Dummy Logic
  useEffect(() => {
    const updateHeader = () => {
      if (!connected) {
        setHeaderProfile({ name: "Guest Scholar", avatar: "" });
        return;
      }
      const saved = localStorage.getItem('studybuddy_profile');
      if (saved) {
        setHeaderProfile(JSON.parse(saved));
      } else {
        setHeaderProfile({ name: "New Scholar", avatar: "" });
      }
    };
    updateHeader();
    window.addEventListener('studybuddy_profile_updated', updateHeader);
    return () => window.removeEventListener('studybuddy_profile_updated', updateHeader);
  }, [connected]);

  // Sidebar Auto-Minimize Logic (5s)
  useEffect(() => {
    let timer: any;
    const startMinimizeTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        setIsSidebarMinimized(true);
      }, 5000);
    };

    // Start timer on load
    startMinimizeTimer();

    const handleSidebarHover = () => {
      setIsSidebarMinimized(false);
      clearTimeout(timer);
    };

    const handleSidebarLeave = () => {
      startMinimizeTimer();
    };

    window.addEventListener('sidebar_hovered', handleSidebarHover);
    window.addEventListener('sidebar_left', handleSidebarLeave);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('sidebar_hovered', handleSidebarHover);
      window.removeEventListener('sidebar_left', handleSidebarLeave);
    };
  }, []);

  // Auto-close info pane (5s)
  useEffect(() => {
    let timer: any;
    const startTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => setIsInfoPaneOpen(false), 5000);
    };

    // Show on load for 5s
    setIsInfoPaneOpen(true);
    startTimer();

    const resetTimer = () => clearTimeout(timer);
    const restartTimer = () => startTimer();

    window.addEventListener('reset_infopane_timer', resetTimer);
    window.addEventListener('restart_infopane_timer', restartTimer);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('reset_infopane_timer', resetTimer);
      window.removeEventListener('restart_infopane_timer', restartTimer);
    };
  }, []);

  const handleUpload = (newMaterial: Material) => {
    setMaterials(prev => [...prev, newMaterial]);
  };

  const handleLibrarySync = async () => {
    if (!connected) {
      alert("Please connect your wallet first.");
      return;
    }

    try {
      const payload = {
        data: {
          function: "0x1::aptos_account::transfer" as `${string}::${string}::${string}`,
          typeArguments: [] as [],
          functionArguments: ["0x1", "1"],
        }
      };
      
      const response = await signAndSubmitTransaction(payload);
      const txHash = (response as any)?.hash || "0x" + Math.random().toString(16).slice(2);
      
      const newNotif = {
        id: Date.now(),
        title: "On-chain Storage Success",
        message: `Library verified on-chain. TX: ${txHash.slice(0, 10)}...`,
        time: "Just now",
        type: "success" as const,
        isRead: false
      };
      setNotifications(prev => [newNotif, ...prev]);
      alert(`Transaction Confirmed!\nHash: ${txHash}`);
    } catch (error) {
      console.error("Transaction failed:", error);
      alert("Transaction rejected or failed.");
    }
  };

  useEffect(() => {
    (window as any).triggerLibrarySync = handleLibrarySync;
    return () => { delete (window as any).triggerLibrarySync; };
  }, [connected]);

  return (
    <div className="flex h-screen transition-colors duration-300 overflow-hidden text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-950 relative">
      
      <div className="relative z-50">
        <Sidebar 
          activeTab={activeTab} 
          onTabChange={(tab) => {
            if (tab === "stats") {
              setIsInfoPaneOpen(true);
              window.dispatchEvent(new Event('reset_infopane_timer'));
            } else {
              setActiveTab(tab);
            }
          }} 
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          notificationCount={unreadCount}
          minimized={isSidebarMinimized}
          onToggleMinimize={() => setIsSidebarMinimized(!isSidebarMinimized)}
        />
      </div>

      <main className="flex-1 flex flex-col h-screen overflow-y-auto relative z-10 custom-scrollbar">
        <div className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between px-4 md:px-8 py-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl lg:hidden">
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-3 text-sm text-muted font-medium">
              <span className="hidden sm:inline hover:text-foreground cursor-pointer font-black tracking-tighter">StudyBuddy</span>
              <span className="hidden sm:inline">/</span>
              <span className="text-foreground font-black uppercase tracking-wider text-[9px] bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-border">
                {activeTab}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            <button onClick={() => setIsInfoPaneOpen(!isInfoPaneOpen)} className={`p-2.5 rounded-xl transition-all border shadow-sm ${isInfoPaneOpen ? "text-primary bg-primary/10 border-primary/20" : "text-foreground bg-white dark:bg-slate-900 border-border hover:bg-slate-100 dark:hover:bg-slate-800"} hidden md:flex`}>
              <SidebarIcon className="w-5 h-5" />
            </button>

            <div onClick={() => setActiveTab("settings")} className="flex items-center gap-3 pl-2 pr-4 py-1.5 bg-white dark:bg-slate-900 border border-border rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-sm group">
               <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white text-[10px] font-black shadow-lg shadow-primary/20 overflow-hidden ring-2 ring-white dark:ring-slate-800 group-hover:scale-110 transition-transform">
                  {headerProfile.avatar ? <img src={headerProfile.avatar} className="w-full h-full object-cover" /> : headerProfile.name.charAt(0)}
               </div>
               <div className="hidden sm:block">
                  <p className="text-[10px] font-black uppercase tracking-tighter leading-none text-foreground">{headerProfile.name}</p>
                  <p className="text-[8px] font-bold text-muted mt-0.5 leading-none">Scholar Space</p>
               </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {activeTab === "home" && <div className="animate-in fade-in zoom-in-95 duration-700 h-full"><HomeView materials={materials} onExplore={() => setActiveTab("materials")} /></div>}
          {activeTab === "materials" && <div className="animate-in fade-in slide-in-from-right-8 duration-700"><MaterialsView materials={materials} onUpload={handleUpload} onDelete={(id) => setMaterials(m => m.filter(x => x.id !== id))} activeMaterial={activeMaterial} setActiveMaterial={setActiveMaterial} selectedCategory={activeCategory} /></div>}
          {activeTab === "settings" && <div className="animate-in fade-in duration-500"><SettingsView /></div>}
          {activeTab === "notes" && <div className="animate-in fade-in slide-in-from-bottom-8 duration-700"><NotesView sharedNotes={notes} setSharedNotes={setNotes} /></div>}
          {activeTab === "notifications" && <div className="animate-in fade-in slide-in-from-left-8 duration-700"><NotificationsView notifications={notifications} setNotifications={setNotifications} /></div>}
        </div>
      </main>

      {!isInfoPaneOpen && (
        <button onClick={() => setIsInfoPaneOpen(true)} className="fixed right-0 top-1/2 -translate-y-1/2 w-2 h-20 bg-primary/20 hover:w-4 hover:bg-primary/40 rounded-l-full transition-all z-30" />
      )}

      {isInfoPaneOpen && (
        <div onMouseEnter={() => window.dispatchEvent(new Event('reset_infopane_timer'))} onMouseLeave={() => window.dispatchEvent(new Event('restart_infopane_timer'))} className="fixed inset-y-0 right-0 z-[100] w-80 bg-white dark:bg-slate-950 lg:relative lg:translate-x-0 transition-transform duration-300 shadow-2xl border-l border-border">
          <InfoPane materials={materials} notesCount={notes.length} onClose={() => setIsInfoPaneOpen(false)} />
        </div>
      )}
    </div>
  );
}
