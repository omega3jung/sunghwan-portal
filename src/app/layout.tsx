// app/layout.tsx.

import "@/styles/globals.css";

import type { Metadata } from "next";
import { Toaster } from "sonner";

import { inter, pretendard } from "./fonts";
import { RootProviders } from "./providers";

export const metadata: Metadata = {
  title: "Sunghwan Portal",
  description: "IT Service Desk (Portfolio)",
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
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${pretendard.variable} antialiased`}>
        <RootProviders>
          {/* <SessionInitializer /> ❌ */}
          {children}
        </RootProviders>
        <Toaster richColors />
      </body>
    </html>
  );
}
