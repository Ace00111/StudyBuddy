import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

// Import fonts via direct CSS or Google Fonts link in layout
// For this environment, we'll assume global CSS handles it or we add a head tag


export const metadata: Metadata = {
  title: "Study Buddy",
  description: "A decentralized file storage system for students built on Shelby Protocol.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen text-slate-100 flex flex-col">

        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
