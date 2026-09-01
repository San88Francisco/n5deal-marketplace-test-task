import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "N5Deal",
  description: "N5Deal application",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="uk">
      <body>{children}</body>
    </html>
  );
}