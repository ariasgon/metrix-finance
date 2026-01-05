import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { AuthModal } from "@/components/layout/AuthModal";
import { Web3Provider } from "@/components/providers/Web3Provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Metrix Finance - DeFi Liquidity Pool Simulator",
  description: "Discover and simulate high-performing concentrated liquidity pools. Optimize your DeFi investments with advanced analytics.",
  keywords: ["DeFi", "Uniswap", "Liquidity Pool", "Yield Farming", "Crypto", "Simulator"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground`}
        suppressHydrationWarning
      >
        <Web3Provider>
          <Navbar />
          <main className="pt-16">
            {children}
          </main>
          <AuthModal />
        </Web3Provider>
      </body>
    </html>
  );
}
