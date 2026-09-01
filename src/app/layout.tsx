import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";

import "./globals.css";
import { SiteHeader } from "@/components/layout/site-header";

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

        <footer className="mt-16 border-t border-ink-100 bg-white">
          <div className="container-page flex flex-col gap-3 py-8 text-[13px] text-ink-500 sm:flex-row sm:items-center sm:justify-between">
            <p>
              N5Deal prototype — built as a technical assignment. Data is fictional and for
              demonstration only.
            </p>
            <div className="flex gap-4">
              <Link href="/assets" className="hover:text-ink-900">
                All listings
              </Link>
              <a
                href="https://n5deal.com"
                className="hover:text-ink-900"
                target="_blank"
                rel="noreferrer"
              >
                n5deal.com
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
