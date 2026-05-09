"use client";

import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Wallet, LogOut, Loader2, AlertCircle, ExternalLink, Copy, Check, ChevronUp, Activity, Globe, ShieldCheck } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { clsx } from "clsx";
import { AptosClient } from "aptos";
import { useWalletAuth } from "@/lib/hooks/useWalletAuth";

const client = new AptosClient("https://fullnode.mainnet.aptoslabs.com");

interface ConnectWalletProps {
  minimized?: boolean;
}

export default function ConnectWallet({ minimized = false }: ConnectWalletProps) {
  const { connect, disconnect, account, connected, isLoading } = useWallet();
  const { user, login, logout, error: authError, isLoading: isAuthLoading } = useWalletAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [balance, setBalance] = useState("0.00");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(authError);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setError(authError);
  }, [authError]);

  useEffect(() => {
    const fetchBalance = async () => {
      if (connected && account?.address) {
        try {
          const resources: any[] = await client.getAccountResources(account.address.toString());
          const accountResource = resources.find((r) => r.type === "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>");
          if (accountResource) {
            setBalance((parseInt(accountResource.data.coin.value) / 100_000_000).toFixed(2));
          }
        } catch (e) {
          console.error(e);
        }
      }
    };
    if (showMenu) fetchBalance();
  }, [connected, account, showMenu]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCopy = () => {
    if (account?.address) {
      navigator.clipboard.writeText(account.address.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const truncateAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  // Show authenticated state if user is logged in
  if (user) {
    return (
      <div className="relative" ref={menuRef}>
        {/* Authenticated Wallet Trigger */}
        <button
          onClick={() => setShowMenu(!showMenu)}
          className={clsx(
            "group flex items-center bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-500/30 hover:border-green-400 transition-all active:scale-95 relative",
            minimized ? "w-12 h-12 rounded-2xl justify-center" : "w-full p-3 rounded-[28px] gap-3"
          )}
        >
          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-green-500/20 group-hover:scale-110 transition-transform">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          {!minimized && (
            <div className="flex-1 text-left min-w-0">
              <p className="text-[10px] font-black truncate text-foreground leading-none mb-1">{user.profile.username}</p>
              <div className="flex items-center gap-1">
                <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                <p className="text-[8px] font-black text-green-600 uppercase tracking-widest">Authenticated</p>
              </div>
            </div>
          )}
          {!minimized && <ChevronUp className={clsx("w-3 h-3 text-muted transition-transform", showMenu && "rotate-180")} />}
        </button>

        {/* Expanded Menu */}
        {showMenu && (
          <div className="absolute bottom-full left-0 mb-4 w-72 bg-white dark:bg-slate-950 border border-border rounded-[40px] shadow-2xl p-6 animate-in slide-in-from-bottom-4 duration-300 z-[100]">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted mb-1">Authenticated User</h4>
                <p className="text-sm font-black text-foreground">{user.profile.username}</p>
              </div>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(user.walletAddress);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all text-primary"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="p-5 bg-slate-50 dark:bg-slate-900 rounded-[32px] mb-6">
              <div className="flex justify-between items-center mb-1">
                <p className="text-[9px] font-black uppercase tracking-widest text-muted">Wallet Address</p>
                <Globe className="w-3 h-3 text-primary" />
              </div>
              <p className="text-sm font-black text-foreground">{truncateAddress(user.walletAddress)}</p>
            </div>

            <div className="space-y-2 mb-6">
              <button 
                onClick={() => window.open(`https://explorer.aptoslabs.com/account/${user.walletAddress}?network=mainnet`, "_blank")}
                className="flex items-center justify-between w-full p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all group"
              >
                <div className="flex items-center gap-3">
                  <Activity className="w-4 h-4 text-muted group-hover:text-primary transition-colors" />
                  <span className="text-[10px] font-black uppercase tracking-widest">View Activity</span>
                </div>
                <ExternalLink className="w-3 h-3 text-muted" />
              </button>
              <div className="flex items-center justify-between w-full p-3.5 bg-green-500/5 rounded-2xl">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-4 h-4 text-green-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-green-600">Secure Session</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                logout();
                disconnect();
                setShowMenu(false);
              }}
              className="flex items-center justify-center gap-2 w-full py-4 text-[10px] font-black uppercase tracking-widest text-red-500 bg-red-500/5 hover:bg-red-500/10 rounded-2xl transition-all"
            >
              <LogOut className="w-4 h-4" />
              Disconnect & Logout
            </button>
          </div>
        )}
      </div>
    );
  }

  // Show wallet connection state if not authenticated
  if (connected && account) {
    return (
      <div className="relative" ref={menuRef}>
        {/* Wallet Connected but Not Authenticated */}
        <button
          onClick={() => setShowMenu(!showMenu)}
          className={clsx(
            "group flex items-center bg-slate-50 dark:bg-slate-900 border border-border hover:border-primary/50 transition-all active:scale-95 relative",
            minimized ? "w-12 h-12 rounded-2xl justify-center" : "w-full p-3 rounded-[28px] gap-3"
          )}
        >
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white shrink-0 shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
            <Wallet className="w-3.5 h-3.5" />
          </div>
          {!minimized && (
            <div className="flex-1 text-left min-w-0">
              <p className="text-[10px] font-black truncate text-foreground leading-none mb-1">{truncateAddress(account.address.toString())}</p>
              <div className="flex items-center gap-1">
                <div className="w-1 h-1 rounded-full bg-yellow-500 animate-pulse" />
                <p className="text-[8px] font-black text-yellow-600 uppercase tracking-widest">Connected</p>
              </div>
            </div>
          )}
          {!minimized && <ChevronUp className={clsx("w-3 h-3 text-muted transition-transform", showMenu && "rotate-180")} />}
        </button>

        {/* Expanded Menu - Awaiting Authentication */}
        {showMenu && (
          <div className="absolute bottom-full left-0 mb-4 w-72 bg-white dark:bg-slate-950 border border-border rounded-[40px] shadow-2xl p-6 animate-in slide-in-from-bottom-4 duration-300 z-[100]">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted mb-1">Connected Wallet</h4>
                <p className="text-sm font-black text-foreground">{truncateAddress(account.address.toString())}</p>
              </div>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(account.address.toString());
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all text-primary"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="p-5 bg-slate-50 dark:bg-slate-900 rounded-[32px] mb-6">
              <div className="flex justify-between items-center mb-1">
                <p className="text-[9px] font-black uppercase tracking-widest text-muted">Aptos Balance</p>
                <Globe className="w-3 h-3 text-primary" />
              </div>
              <p className="text-3xl font-black tracking-tighter text-foreground">{balance} APT</p>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-[9px] font-bold text-red-600 dark:text-red-400 mb-4">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2 mb-6">
              <button 
                onClick={() => window.open(`https://explorer.aptoslabs.com/account/${account.address}?network=mainnet`, "_blank")}
                className="flex items-center justify-between w-full p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all group"
              >
                <div className="flex items-center gap-3">
                  <Activity className="w-4 h-4 text-muted group-hover:text-primary transition-colors" />
                  <span className="text-[10px] font-black uppercase tracking-widest">View Activity</span>
                </div>
                <ExternalLink className="w-3 h-3 text-muted" />
              </button>
              <button 
                onClick={async () => {
                  await login();
                  setShowMenu(false);
                }}
                disabled={isAuthLoading}
                className="flex items-center justify-center gap-2 w-full py-4 text-[10px] font-black uppercase tracking-widest text-white bg-green-500 hover:bg-green-600 disabled:opacity-50 rounded-2xl transition-all"
              >
                {isAuthLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                Authenticate Wallet
              </button>
            </div>

            <button
              onClick={() => disconnect()}
              className="flex items-center justify-center gap-2 w-full py-4 text-[10px] font-black uppercase tracking-widest text-red-500 bg-red-500/5 hover:bg-red-500/10 rounded-2xl transition-all"
            >
              <LogOut className="w-4 h-4" />
              Disconnect Wallet
            </button>
          </div>
        )}
      </div>
    );
  }

  // Show connect wallet button if not connected
  return (
    <div className="space-y-3">
      {error && !minimized && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-[9px] font-bold text-red-600 dark:text-red-400">
          <AlertCircle className="w-3 h-3 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <button
        onClick={() => connect("Petra" as any)}
        disabled={isLoading}
        className={clsx(
          "w-full flex items-center bg-primary text-white transition-all disabled:opacity-50 shadow-xl shadow-primary/30 active:scale-95 group relative",
          minimized ? "h-12 w-12 rounded-2xl justify-center" : "px-5 py-4 rounded-[24px] justify-between"
        )}
      >
        <div className="flex items-center gap-3">
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wallet className="w-4 h-4" />}
          {!minimized && <span className="font-black text-[10px] uppercase tracking-widest">Connect Aptos</span>}
        </div>
        {!minimized && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
      </button>
    </div>
  );
}
