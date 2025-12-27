// app/(protected)/layout.tsx
"use client";

import { Loader2 } from "lucide-react";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

import { LeftMenu } from "@/components/layout/LeftMenu";
import { NavigationBar } from "@/components/layout/NavigationBar";
import { useCurrentSession } from "@/hooks/useCurrentSession";

import { ProtectedProviders } from "./_providers";

// force-dynamic to block cache store.
//export const dynamic = "force-dynamic";
//export const revalidate = 0;

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const session = useCurrentSession();
  const isDemoUser = session.current.dataScope === "LOCAL";

  if (session.status === "loading") {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  if (session.status === "unauthenticated") {
    redirect("/login");
  }

  // 👇 From here on, authenticated is guaranteed.
  return (
    // UI root container (absolute overlays are positioned relative to this)
    <ProtectedProviders>
      {/* Demo Overlay */}
      {isDemoUser && <DemoOverlay />}

      {/* Left Menu */}
      <LeftMenu></LeftMenu>

      {/* Right Main Screen */}
      <div className="grid grid-rows-[auto_1fr_auto] h-screen w-screen min-h-0">
        {/* Top Navigation */}
        <NavigationBar className="h-14" />

        {/* Page Content */}
        <main className="overflow-auto p-4 min-h-0 bg-background">
          {children}
        </main>

        {/* Footer */}
        <footer className="h-10 px-4 py-2 border-t text-sm text-muted-foreground">
          <a href="https://github.com/omega3jung/sunghwan-portal">
            © 2025 SungHwan Jung.
          </a>
        </footer>
      </div>
    </ProtectedProviders>
  );
}

const DemoOverlay = () => {
  return (
    <>
      <div className="absolute inset-0 w-full h-full border-2 border-orange-400 z-50 pointer-events-none"></div>
      <div className="absolute bottom-2 right-4 text-xl font-bold text-orange-400 z-50 pointer-events-none">
        Demo
      </div>
    </>
  );
};
