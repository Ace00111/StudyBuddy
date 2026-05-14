"use client";

import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { PetraWallet } from "petra-plugin-wallet-adapter";
import { ThemeProvider } from "next-themes";
import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ShelbyClientProvider } from "@shelby-protocol/react";
import { shelbyClient } from "@/lib/shelbyClient";

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const wallets = [
    new PetraWallet(),
  ];

  useEffect(() => {
    setMounted(true);
    document.documentElement.classList.add('dark');
  }, []);

  if (!mounted) {
    return (
      <QueryClientProvider client={queryClient}>
        <ShelbyClientProvider client={shelbyClient}>
          <AptosWalletAdapterProvider autoConnect={false}>
            {children}
          </AptosWalletAdapterProvider>
        </ShelbyClientProvider>
      </QueryClientProvider>
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} forcedTheme="dark">
      <QueryClientProvider client={queryClient}>
        <ShelbyClientProvider client={shelbyClient}>
          <AptosWalletAdapterProvider autoConnect={false}>
            {children}
          </AptosWalletAdapterProvider>
        </ShelbyClientProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
