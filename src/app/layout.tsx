// app/layout.tsx.

import "@/styles/globals.css";

import type { Metadata } from "next";
import localFont from "next/font/local";
import { Toaster } from "sonner";

import { detectBrowserLanguage } from "@/lib/i18n/detectLanguage";

import { RootProviders } from "./providers";

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
  title: "Sunghwan Portal",
  description: "IT Help Desk (Portfolio)",
  icons: {
    icon: "/images/icon_light.png",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const lang = detectBrowserLanguage();

  return (
    <html lang={lang} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <RootProviders>{children}</RootProviders>
        <Toaster />
      </body>
    </html>
  );
}
