"use client";

import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { LogOut, Wallet, AlertCircle } from "lucide-react";
import { useState } from "react";

export default function ConnectWallet() {
  const { connect, account, disconnect, wallets } = useWallet();
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    console.log("Detecting wallets...", wallets);
    
    try {
      setError(null);
      
      const isPetraInstalled = (window as any).aptos !== undefined;
      console.log("Window.aptos detected:", isPetraInstalled);

      if (!isPetraInstalled) {
        setError("Petra Wallet extension not detected in browser.");
        window.open("https://chromewebstore.google.com/detail/petra-aptos-wallet/ejjciapejcjjhgeoloeidcaidfnjocne", "_blank");
        return;
      }

      // Find by name exactly as the adapter reports it
      const petra = wallets.find(w => w.name === "Petra");
      
      if (petra) {
        console.log("Found Petra adapter, connecting...");
        await connect(petra.name);
      } else if (wallets.length > 0) {
        console.log("Petra adapter not found, available:", wallets.map(w => w.name));
        // Try the first available as a last resort or Petra by string
        await connect("Petra");
      } else {
        console.log("No adapters found, attempting direct connect to 'Petra'");
        await connect("Petra");
      }
    } catch (e: any) {
      console.error("Wallet connection error:", e);
      setError("Connection failed. Please unlock your Petra extension.");
      setTimeout(() => setError(null), 4000);
    }
  };

  if (account) {
    return (
      <div className="space-y-2 w-full px-4 mt-6">
        <button
          onClick={disconnect}
          className="group flex items-center gap-3 px-4 py-3 text-sm font-bold text-foreground bg-card border border-border hover:border-red-200 dark:hover:border-red-900/30 rounded-2xl transition-all w-full shadow-sm"
        >
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-white text-xs shadow-lg shadow-blue-500/20">
            <Wallet className="w-4 h-4" />
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className="leading-tight truncate">{account.address.slice(0, 6)}...{account.address.slice(-4)}</p>
            <div className="flex items-center gap-1">
               <span className="text-[10px] text-green-500 font-bold uppercase tracking-wider">Connected</span>
               <span className="w-1 h-1 rounded-full bg-slate-400" />
               <span className="text-[8px] text-primary font-black uppercase">Shelby Active</span>
            </div>
          </div>
          <LogOut className="w-4 h-4 text-muted group-hover:text-red-500 transition-colors" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2 w-full px-4 mt-6">
      {error && (
        <div className="flex items-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-[10px] font-bold animate-in fade-in slide-in-from-top-1">
          <AlertCircle className="w-3.5 h-3.5" />
          {error}
        </div>
      )}
      <button
        onClick={handleConnect}
        className="flex flex-col items-center gap-1 px-4 py-3 text-sm font-bold text-white bg-[#0f172a] hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 rounded-2xl transition-all w-full justify-center shadow-lg shadow-slate-900/20 dark:shadow-none border border-transparent"
      >
        <div className="flex items-center gap-2">
          <Wallet className="w-5 h-5" />
          Connect Aptos Wallet
        </div>
        <span className="text-[9px] opacity-60 font-medium uppercase tracking-widest">Supports Shelby Protocol</span>
      </button>
    </div>
  );
}





