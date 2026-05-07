"use client";

import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { PetraWallet } from "petra-plugin-wallet-adapter";
import { ThemeProvider } from "next-themes";
import { useEffect, useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const wallets = [
    new PetraWallet(),
    // WalletConnect integration would go here if plugin was installed
  ];

  useEffect(() => {
    setMounted(true);
    // Force dark mode by setting class on document
    document.documentElement.classList.add('dark');
  }, []);

  // Return children without ThemeProvider during SSR to prevent hydration script errors
  if (!mounted) {
    return (
      <AptosWalletAdapterProvider autoConnect={false}>
        {children}
      </AptosWalletAdapterProvider>
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} forcedTheme="dark">
      <AptosWalletAdapterProvider autoConnect={false}>
        {children}
      </AptosWalletAdapterProvider>
    </ThemeProvider>
  );
}
