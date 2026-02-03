import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Crypto Exchange Checker",
  description: "查询交易所充值/提现状态",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-Hans">
      <body className="min-h-screen bg-gray-950 text-gray-100 font-sans">
        {children}
      </body>
    </html>
  );
}
