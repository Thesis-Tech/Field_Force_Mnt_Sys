import type { Metadata } from "next";
import { Inter, Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import StoreProvider from "@/components/StoreProvider";

const inter = Inter({ subsets: ["latin"], display: "swap" });
const hankenGrotesk = Hanken_Grotesk({ subsets: ["latin"], display: "swap", variable: '--font-hanken' });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], display: "swap", variable: '--font-jetbrains' });

export const metadata: Metadata = {
  title: "Field Force Management | Admin Dashboard",
  description: "Real-time workforce monitoring and management system for field employees.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.className} ${hankenGrotesk.variable} ${jetbrainsMono.variable}`}>
      <body className={inter.className}>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
