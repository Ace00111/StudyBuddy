"use client";

import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { PetraWallet } from "petra-plugin-wallet-adapter";
import { ThemeProvider } from "next-themes";

export function Providers({ children }: { children: React.ReactNode }) {
  const wallets = [new PetraWallet()];

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AptosWalletAdapterProvider plugins={wallets} autoConnect={false}>
        {children}
      </AptosWalletAdapterProvider>
    </ThemeProvider>
  );
}
