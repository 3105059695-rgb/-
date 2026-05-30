import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "桐薇宇宙 - 沉浸式CP互动",
  description: "以田曦薇、李一桐的真实性格与互动为蓝本的沉浸式CP互动空间",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "桐薇宇宙",
    description: "以田曦薇、李一桐的真实性格与互动为蓝本的沉浸式CP互动空间",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;600;700&family=Noto+Serif+SC:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  );
}
