"use client";

import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { LogOut, Wallet } from "lucide-react";

export default function ConnectWallet() {
  const { connect, account, disconnect } = useWallet();

  if (account) {
    return (
      <button
        onClick={disconnect}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors w-full justify-start"
      >
        <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
          {account.address.slice(2, 4)}
        </div>
        <span className="flex-1 text-left truncate max-w-[120px]">
          {account.address.slice(0, 6)}...{account.address.slice(-4)}
        </span>
        <LogOut className="w-4 h-4 text-slate-400" />
      </button>
    );
  }

  return (
    <button
      onClick={() => connect("Petra")}
      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 rounded-lg transition-colors w-full justify-center"
    >
      <Wallet className="w-4 h-4" />
      Connect Wallet
    </button>
  );
}
