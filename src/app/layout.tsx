import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

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
      <body className="antialiased min-h-screen text-slate-900 dark:text-slate-100 flex flex-col">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
