import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "N5Deal — FinTech M&A marketplace",
    template: "%s · N5Deal",
  },
  description:
    "Buy and sell licensed financial companies across 30+ jurisdictions. Vetted assets, structured mandates, direct contact between buyers and sellers.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
