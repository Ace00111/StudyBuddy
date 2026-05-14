"use client";

import { User, Bell, Shield, Wallet, Laptop, Moon, Sun, Camera, Check, X, Edit3, ExternalLink, Globe, Database, EyeOff, Lock, Ghost, ShieldAlert, ShieldCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { AptosClient } from "aptos";
import { loadWalletProfile, saveWalletProfile } from "@/lib/walletStorage";

// Wallet-specific settings functions
const getWalletSettingsKey = (walletAddress: string) => `studybuddy_wallet_${walletAddress}_settings`;

const loadWalletSettings = (walletAddress: string) => {
  if (typeof window === "undefined" || !walletAddress) return null;
  try {
    const raw = localStorage.getItem(getWalletSettingsKey(walletAddress));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const saveWalletSettings = (walletAddress: string, settings: any) => {
  if (typeof window === "undefined" || !walletAddress) return;
  localStorage.setItem(getWalletSettingsKey(walletAddress), JSON.stringify(settings));
};

const NODE_URL = "https://fullnode.mainnet.aptoslabs.com";
const client = new AptosClient(NODE_URL);

export default function SettingsView() {
  const { account, connected } = useWallet();
  const [activeSection, setActiveSection] = useState("Profile");
  const [isEditing, setIsEditing] = useState(false);
  const [balance, setBalance] = useState<string>("0.00");
  
  // Persistent Profile
  const [profile, setProfile] = useState({
    name: "Scholar User",
    email: "scholar@studybuddy.io",
    avatar: ""
  });
  const [tempProfile, setTempProfile] = useState({ ...profile });

  const [toggles, setToggles] = useState({
    notifications: { email: true, push: false },
    privacy: { stealthMode: false, encryptedPreviews: true, hideActivity: false, incognitoSync: false }
  });

  // Load from wallet-specific localStorage
  useEffect(() => {
    if (!connected || !account?.address) {
      const dummy = { name: "Guest Scholar", email: "guest@studybuddy.io", avatar: "" };
      setProfile(dummy);
      setTempProfile(dummy);
      return;
    }

    const walletAddress = account.address.toString();
    const savedProfile = loadWalletProfile(walletAddress);
    if (savedProfile) {
      setProfile(savedProfile);
      setTempProfile(savedProfile);
    } else {
      // New wallet - set default profile
      const defaultProfile = { name: "New Scholar", email: "", avatar: "" };
      setProfile(defaultProfile);
      setTempProfile(defaultProfile);
    }

    // Load wallet-specific settings
    const savedSettings = loadWalletSettings(walletAddress);
    if (savedSettings) {
      setToggles(savedSettings);
    }
  }, [connected, account?.address]);

  // Fetch Balance
  useEffect(() => {
    const fetchBalance = async () => {
      if (connected && account?.address) {
        try {
          const resources: any[] = await client.getAccountResources(account.address.toString());
          const accountResource = resources.find((r) => r.type === "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>");
          if (accountResource) {
            const amount = accountResource.data.coin.value;
            setBalance((parseInt(amount) / 100_000_000).toFixed(2));
          }
        } catch (e) {
          console.error("Balance fetch error:", e);
        }
      }
    };
    fetchBalance();
  }, [connected, account]);

  const handleSave = async () => {
    if (!account?.address) return;

    const walletAddress = account.address.toString();
    setProfile(tempProfile);
    saveWalletProfile(walletAddress, tempProfile);
    
    // Sync with database
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: tempProfile.email, name: tempProfile.name }),
      });
      if (response.ok) {
        console.log("Profile synchronized with database.");
      }
    } catch (e) {
      console.error("Database sync failed:", e);
    }

    setIsEditing(false);
    window.dispatchEvent(new Event('studybuddy_profile_updated'));
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

  const handleToggle = (section: keyof typeof toggles, key: string) => {
    if (!account?.address) return;

    const walletAddress = account.address.toString();
    const newToggles = {
      ...toggles,
      [section]: {
        ...toggles[section as keyof typeof toggles],
        [key]: !(toggles[section as keyof typeof toggles] as any)[key]
      }
    };
    setToggles(newToggles);
    saveWalletSettings(walletAddress, newToggles);
    window.dispatchEvent(new Event('studybuddy_settings_updated'));
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background transition-colors">
      <div className="px-8 pt-8 pb-4 max-w-6xl mx-auto w-full text-white">
        <h1 className="text-4xl font-black tracking-tighter mb-2">Settings</h1>
        <p className="text-slate-500 text-sm font-medium">Manage your scholar profile and secure storage preferences.</p>
      </div>

      <div className="px-8 pb-8 max-w-6xl mx-auto w-full">
        <div className="bg-card border border-slate-800 rounded-[48px] overflow-hidden shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-4 min-h-[650px]">
            {/* Sidebar menu */}
            <div className="p-6 border-r border-slate-800 bg-slate-900/30">
              <nav className="space-y-2">
                {[
                  { icon: User, label: "Profile" },
                  { icon: Wallet, label: "Wallet" },
                  { icon: Lock, label: "Privacy" },
                  { icon: Bell, label: "Notifications" },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => setActiveSection(item.label)}
                    className={`w-full flex items-center gap-3 px-5 py-4 rounded-[24px] text-sm font-black transition-all ${
                      activeSection === item.label
                        ? "bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]"
                        : "text-slate-500 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Content area */}
            <div className="col-span-3 p-12 overflow-y-auto custom-scrollbar bg-[#0a0c14]/50">
              
              {/* Profile Section */}
              {activeSection === "Profile" && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="flex justify-between items-start mb-10">
                    <h3 className="text-2xl font-black tracking-tight text-white">Scholar Profile</h3>
                    {connected && !isEditing && (
                      <button 
                        onClick={() => setIsEditing(true)}
                        className="px-5 py-2.5 bg-primary/10 text-primary rounded-xl text-[10px] font-black uppercase tracking-widest border border-primary/20 hover:bg-primary hover:text-white transition-all"
                      >
                        Edit Profile
                      </button>
                    )}
                  </div>
                  
                  {isEditing ? (
                    <div className="space-y-8">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-6">
                            <div>
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Full Name</label>
                              <input 
                                type="text" 
                                className="w-full px-6 py-4 bg-slate-900 border border-slate-800 rounded-2xl focus:border-primary outline-none font-bold text-white"
                                value={tempProfile.name}
                                onChange={(e) => setTempProfile({ ...tempProfile, name: e.target.value })}
                                placeholder="Enter your full name"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Email Address</label>
                              <input 
                                type="email" 
                                className="w-full px-6 py-4 bg-slate-900 border border-slate-800 rounded-2xl focus:border-primary outline-none text-white"
                                value={tempProfile.email}
                                onChange={(e) => setTempProfile({ ...tempProfile, email: e.target.value })}
                                placeholder="Enter your email address"
                              />
                            </div>
                          </div>
                          <div className="flex flex-col items-center justify-center p-8 bg-slate-900 border border-dashed border-slate-800 rounded-[40px] group relative overflow-hidden transition-all hover:border-primary/50">
                             {tempProfile.avatar ? (
                               <div className="absolute inset-0 w-full h-full">
                                  <img src={tempProfile.avatar} alt="Avatar" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                                     <button 
                                       onClick={() => setTempProfile({ ...tempProfile, avatar: "" })}
                                       className="p-3 bg-red-500 text-white rounded-2xl hover:scale-110 transition-transform shadow-xl"
                                       aria-label="Remove avatar"
                                     >
                                        <X className="w-5 h-5" />
                                     </button>
                                     <span className="text-[10px] font-black uppercase tracking-widest text-white">Remove Photo</span>
                                  </div>
                               </div>
                             ) : (
                               <div className="relative z-10 flex flex-col items-center">
                                  <div className="w-20 h-20 rounded-full bg-slate-800/80 backdrop-blur-md flex items-center justify-center text-primary mb-4 border-2 border-primary/30 shadow-xl group-hover:scale-110 transition-all">
                                     <Camera className="w-8 h-8" />
                                  </div>
                                  <span className="px-4 py-1.5 bg-primary text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">Upload Photo</span>
                               </div>
                             )}
                             {!tempProfile.avatar && <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer z-20" aria-label="Upload avatar" />}
                          </div>
                          
                          <div className="mt-4 p-5 bg-primary/5 border border-primary/10 rounded-[32px] flex items-center justify-between">
                             <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                   <ShieldCheck className="w-4 h-4" />
                                </div>
                                <div>
                                   <p className="text-[10px] font-black uppercase tracking-widest text-primary leading-none mb-1">Identity Sync</p>
                                   <p className="text-[9px] font-bold text-slate-500 leading-none">Ready for on-chain verification</p>
                                </div>
                             </div>
                             <button className="px-4 py-2 bg-primary text-white rounded-xl text-[8px] font-black uppercase tracking-widest hover:scale-105 transition-all">Sync Now</button>
                          </div>
                       </div>
                       <div className="flex gap-4 pt-6">
                        <button onClick={handleSave} className="px-8 py-4 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20">Save Changes</button>
                        <button onClick={() => { setIsEditing(false); setTempProfile({...profile}); }} className="px-8 py-4 bg-slate-800 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest">Cancel</button>
                       </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-10 p-10 rounded-[48px] bg-slate-900/30 border border-slate-800">
                      <div className="w-28 h-28 rounded-[36px] bg-primary flex items-center justify-center text-4xl font-black text-white shadow-2xl shadow-primary/30 overflow-hidden">
                        {profile.avatar ? <img src={profile.avatar} className="w-full h-full object-cover" alt="Profile avatar" /> : profile.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="font-black text-3xl tracking-tighter text-white">{profile.name}</p>
                        <p className="text-slate-500 font-bold mt-1">{profile.email}</p>
                        <div className="flex gap-2 mt-6">
                          <span className="px-4 py-1.5 bg-green-500/10 text-green-500 text-[9px] font-black uppercase tracking-widest rounded-full border border-green-500/20">Verified Identity</span>
                        </div>
                      </div>
                      {!connected && (
                        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-[10px] font-bold text-amber-500 max-w-[150px] text-center">
                          Connect wallet to edit profile
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Wallet Section */}
              {activeSection === "Wallet" && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-10">
                  <h3 className="text-2xl font-black tracking-tight text-white">Wallet</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="p-10 rounded-[48px] bg-[#020617] text-white shadow-2xl relative overflow-hidden group border border-slate-800">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/20 rounded-full -mr-20 -mt-20 blur-3xl" />
                        <div className="flex justify-between items-start mb-12">
                           <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center"><Wallet className="w-7 h-7 text-primary" /></div>
                           <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Aptos Mainnet</span>
                        </div>
                        <p className="text-5xl font-black tracking-tighter mb-2">{connected ? balance : "0.00"} APT</p>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Actual Balance</p>
                     </div>

                     <div className="p-10 rounded-[48px] bg-slate-900/50 border border-slate-800 shadow-sm group">
                        <div className="flex justify-between items-start mb-12">
                           <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary"><Globe className="w-7 h-7" /></div>
                           <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">On-Chain Data</span>
                        </div>
                        <h4 className="text-2xl font-black mb-6 text-white">Aptos Explorer</h4>
                        <button onClick={() => window.open(`https://explorer.aptoslabs.com/account/${account?.address}?network=mainnet`, "_blank")} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-primary hover:underline">
                           View Transactions <ExternalLink className="w-3 h-3" />
                        </button>
                     </div>
                  </div>
                </div>
              )}

               {/* Privacy */}
              {activeSection === "Privacy" && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-8">
                  <h3 className="text-2xl font-black tracking-tight text-white">Privacy Controls</h3>
                  <div className="space-y-4">
                    {[
                      { key: 'stealthMode', icon: Ghost, label: 'Stealth Mode', desc: 'Blur sensitive titles and data in the UI' },
                      { key: 'hideActivity', icon: EyeOff, label: 'Hide Activity', desc: 'Do not show your study history on home page' },
                      { key: 'incognitoSync', icon: ShieldAlert, label: 'Incognito Sync', desc: 'Remove file metadata before on-chain push' },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between p-8 rounded-[32px] bg-slate-900/30 border border-slate-800">
                        <div className="flex items-center gap-5">
                           <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center text-primary shadow-sm"><item.icon className="w-6 h-6" /></div>
                           <div>
                              <p className="text-lg font-black tracking-tight text-white">{item.label}</p>
                              <p className="text-xs text-slate-500 font-medium">{item.desc}</p>
                           </div>
                        </div>
                        <button onClick={() => handleToggle('privacy', item.key)} className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all ${ (toggles.privacy as any)[item.key] ? "bg-primary" : "bg-slate-700" }`} aria-label={`Toggle ${item.label}`}>
                          <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform ${ (toggles.privacy as any)[item.key] ? "translate-x-7" : "translate-x-1" }`} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notifications */}
              {activeSection === "Notifications" && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-10">
                  <h3 className="text-2xl font-black tracking-tight text-white">Notifications</h3>
                  <div className="space-y-4">
                    {[
                      { key: 'email', label: 'Email Reports', desc: 'Weekly summary of your library activity and storage usage' },
                      { key: 'push', label: 'Push Notifications', desc: 'Real-time desktop alerts for system events' },
                      { key: 'syncAlerts', label: 'Sync Successful Alerts', desc: 'Notify when files are successfully verified on-chain' },
                      { key: 'reminders', label: 'Study Reminders', desc: 'Personalized alerts for upcoming lecture reviews' },
                      { key: 'security', label: 'Library Security Alerts', desc: 'Immediate notification of unauthorized access attempts' },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between p-8 rounded-[32px] bg-slate-900/30 border border-slate-800 hover:bg-slate-800/50 transition-all">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                              <Bell className="w-4 h-4" />
                           </div>
                           <div>
                              <p className="text-lg font-black tracking-tight text-white">{item.label}</p>
                              <p className="text-xs text-slate-500 font-medium">{item.desc}</p>
                           </div>
                        </div>
                        <button 
                          onClick={() => handleToggle('notifications', item.key)}
                          className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all ${
                            (toggles.notifications as any)[item.key] ? "bg-primary" : "bg-slate-700"
                          }`}
                          aria-label={`Toggle ${item.label}`}
                        >
                          <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform ${
                            (toggles.notifications as any)[item.key] ? "translate-x-7" : "translate-x-1"
                          }`} />
                        </button>
                      </div>
                    ))}
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
