"use client";

import { User, Bell, Shield, Wallet, Laptop, Moon, Sun, Camera, Check, X } from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

export default function SettingsView() {
  const { account, connected } = useWallet();
  const [activeSection, setActiveSection] = useState("Profile");
  const [isEditing, setIsEditing] = useState(false);
  
  // Persistence Mock (using state as primary, could use useEffect to load/save)
  const [profile, setProfile] = useState({
    name: "Scholar User",
    email: "scholar@studybuddy.io",
    avatar: ""
  });
  const [tempProfile, setTempProfile] = useState({ ...profile });

  const [toggles, setToggles] = useState({
    notifications: {
      email: true,
      push: false,
      updates: true
    },
    security: {
      twoFactor: false,
      biometric: true,
      stealthMode: false
    },
    protocol: {
      autoSync: true,
      peerDiscovery: false
    }
  });

  const handleSave = () => {
    setProfile(tempProfile);
    setIsEditing(false);
    // In a real app, you'd save to a backend or localStorage here
  };

  const handleToggle = (section: keyof typeof toggles, key: string) => {
    setToggles({
      ...toggles,
      [section]: {
        ...toggles[section as keyof typeof toggles],
        [key]: !(toggles[section as keyof typeof toggles] as any)[key]
      }
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempProfile({ ...tempProfile, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background transition-colors">
      <div className="px-8 pt-8 pb-4">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Settings</h1>
        <p className="text-muted text-sm">Manage your account and protocol preferences.</p>
      </div>

      <div className="px-8 pb-8 max-w-5xl">
        <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-4 min-h-[600px]">
            {/* Sidebar menu inside settings */}
            <div className="p-4 border-r border-border bg-sidebar/30">
              <nav className="space-y-1">
                {[
                  { icon: User, label: "Profile" },
                  { icon: Bell, label: "Notifications" },
                  { icon: Shield, label: "Security" },
                  { icon: Wallet, label: "Wallet" },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => setActiveSection(item.label)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                      activeSection === item.label
                        ? "bg-primary text-white shadow-lg shadow-primary/20"
                        : "text-muted hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Content area */}
            <div className="col-span-3 p-10 overflow-y-auto">
              
              {/* Profile Section */}
              {activeSection === "Profile" && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                  <h3 className="text-xl font-bold mb-8">Account Profile</h3>
                  
                  {isEditing ? (
                    <div className="space-y-8">
                      <div className="flex items-center gap-8">
                        <div className="relative group">
                          <div className="w-24 h-24 rounded-3xl bg-slate-800 flex items-center justify-center overflow-hidden border-2 border-dashed border-slate-700 group-hover:border-primary transition-colors">
                            {tempProfile.avatar ? (
                              <img src={tempProfile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                              <Camera className="w-10 h-10 text-slate-500 group-hover:text-primary" />
                            )}
                          </div>
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="absolute inset-0 opacity-0 cursor-pointer" 
                            onChange={handleImageChange}
                          />
                        </div>
                        <div className="flex-1 space-y-4">
                          <div>
                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted mb-1 block">Full Name</label>
                            <input 
                              type="text" 
                              className="w-full px-5 py-3 bg-slate-800/50 rounded-2xl border border-border focus:ring-2 focus:ring-primary outline-none font-bold"
                              value={tempProfile.name}
                              onChange={(e) => setTempProfile({ ...tempProfile, name: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted mb-1 block">Email Address</label>
                            <input 
                              type="email" 
                              className="w-full px-5 py-3 bg-slate-800/50 rounded-2xl border border-border focus:ring-2 focus:ring-primary outline-none"
                              value={tempProfile.email}
                              onChange={(e) => setTempProfile({ ...tempProfile, email: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-3 pt-4">
                        <button 
                          onClick={handleSave}
                          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl text-sm font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all"
                        >
                          <Check className="w-4 h-4" /> Save Changes
                        </button>
                        <button 
                          onClick={() => { setIsEditing(false); setTempProfile({ ...profile }); }}
                          className="px-6 py-3 bg-slate-800 text-slate-300 rounded-2xl text-sm font-bold hover:bg-slate-700 transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-8 p-8 rounded-[40px] bg-slate-800/30 border border-border/50">
                      <div className="w-24 h-24 rounded-3xl bg-primary flex items-center justify-center text-3xl font-black text-white shadow-2xl shadow-primary/30 overflow-hidden border-4 border-slate-900">
                        {profile.avatar ? (
                          <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          profile.name.charAt(0)
                        )}
                      </div>
                      <div>
                        <p className="font-black text-2xl tracking-tight">{profile.name}</p>
                        <p className="text-muted font-medium">{profile.email}</p>
                        <div className="flex gap-2 mt-4">
                          <span className="px-3 py-1 bg-green-500/10 text-green-500 text-[10px] font-black uppercase rounded-lg border border-green-500/20">Verified Account</span>
                          <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase rounded-lg border border-primary/20">Beta Scholar</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => setIsEditing(true)}
                        className="ml-auto p-4 bg-slate-900 border border-border rounded-2xl hover:bg-slate-800 transition-all shadow-xl"
                        title="Edit Profile"
                      >
                        <Edit3 className="w-5 h-5 text-primary" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Notifications Section */}
              {activeSection === "Notifications" && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-8">
                  <h3 className="text-xl font-bold mb-6">Notification Settings</h3>
                  <div className="space-y-4">
                    {[
                      { key: 'email', label: 'Email Alerts', desc: 'Get updates about your materials in your inbox' },
                      { key: 'push', label: 'Push Notifications', desc: 'Real-time alerts when classmates interact' },
                      { key: 'updates', label: 'Protocol Updates', desc: 'Important news about Shelby Protocol changes' },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between p-6 rounded-3xl bg-slate-800/20 border border-border/50">
                        <div>
                          <p className="font-bold">{item.label}</p>
                          <p className="text-xs text-muted">{item.desc}</p>
                        </div>
                        <button 
                          onClick={() => handleToggle('notifications', item.key)}
                          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                            (toggles.notifications as any)[item.key] ? "bg-primary" : "bg-slate-700"
                          }`}
                        >
                          <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                            (toggles.notifications as any)[item.key] ? "translate-x-6" : "translate-x-1"
                          }`} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Security Section */}
              {activeSection === "Security" && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-8">
                  <h3 className="text-xl font-bold mb-6">Security & Privacy</h3>
                  <div className="space-y-4">
                     <div className="flex items-center justify-between p-6 rounded-3xl bg-slate-800/20 border border-border/50">
                        <div>
                          <p className="font-bold">Two-Factor Authentication</p>
                          <p className="text-xs text-muted">Secure your account with an extra layer of protection</p>
                        </div>
                        <button 
                          onClick={() => handleToggle('security', 'twoFactor')}
                          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                            toggles.security.twoFactor ? "bg-primary" : "bg-slate-700"
                          }`}
                        >
                          <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                            toggles.security.twoFactor ? "translate-x-6" : "translate-x-1"
                          }`} />
                        </button>
                     </div>
                     <div className="flex items-center justify-between p-6 rounded-3xl bg-slate-800/20 border border-border/50">
                        <div>
                          <p className="font-bold">Stealth Mode</p>
                          <p className="text-xs text-muted">Hide your online status and study activity from others</p>
                        </div>
                        <button 
                          onClick={() => handleToggle('security', 'stealthMode')}
                          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                            toggles.security.stealthMode ? "bg-primary" : "bg-slate-700"
                          }`}
                        >
                          <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                            toggles.security.stealthMode ? "translate-x-6" : "translate-x-1"
                          }`} />
                        </button>
                     </div>
                  </div>
                </div>
              )}

              {/* Wallet Section */}
              {activeSection === "Wallet" && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                  <h3 className="text-xl font-bold mb-8">Protocol Wallet</h3>
                  <div className={`p-8 rounded-[40px] border shadow-2xl ${
                    connected 
                      ? "bg-green-500/5 border-green-500/20 shadow-green-500/5" 
                      : "bg-amber-500/5 border-amber-500/20 shadow-amber-500/5"
                  }`}>
                    <div className="flex flex-col items-center text-center space-y-6">
                      <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
                        connected ? "bg-green-500/20 text-green-500" : "bg-amber-500/20 text-amber-500"
                      }`}>
                        <Wallet className="w-10 h-10" />
                      </div>
                      <div>
                        <h4 className="text-2xl font-black">{connected ? "Connected to Aptos" : "Connection Required"}</h4>
                        <p className="text-muted text-sm mt-2 max-w-sm mx-auto">
                          {connected 
                            ? `Your storage node is currently linked to address: ${account?.address}` 
                            : "Please connect your Aptos wallet via the sidebar to enable decentralized storage features."}
                        </p>
                      </div>
                      {connected && (
                         <div className="w-full pt-6 border-t border-border/50">
                            <div className="flex justify-between items-center text-sm mb-2">
                               <span className="text-muted font-bold">Node Health</span>
                               <span className="text-green-500 font-black">EXCELLENT</span>
                            </div>
                            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                               <div className="h-full bg-green-500 w-[94%]" />
                            </div>
                         </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

