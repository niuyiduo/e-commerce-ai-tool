import type { Metadata } from "next";
import React, { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "朵朵素材魔方",
  description: "基于 AI 的电商素材智能生成工具",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
