import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

import { Providers } from "@/components/providers";
import { AppShell } from "@/components/layout/app-shell";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "智枢 · 合规大模型选型与营销赋能平台",
  description:
    "依托天翼云已备案的国产大模型能力池,做 ToB 为主的「选型 + 营销」智能赋能平台。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
