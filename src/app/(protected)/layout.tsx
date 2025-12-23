// app/(protected)/layout.tsx
"use client";

import { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { useCurrentSession } from "@/hooks/useCurrentSession";
import { LeftMenu } from "@/components/layout/LeftMenu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ProtectedProviders } from "./providers";

// force-dynamic to block cache store.
//export const dynamic = "force-dynamic";
//export const revalidate = 0;

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const session = useCurrentSession();

  if (session.status === "loading") {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  return (
    <ProtectedProviders>
      {/* Left Menu */}
      <LeftMenu></LeftMenu>

      {/* Right Main Screen */}
      <div className="grid grid-rows-[auto_1fr_auto] h-screen w-screen min-h-0">
        {/* Top Navigation */}
        <header className="h-14 flex items-center px-4 z-10 border-b-[1px]">
          <SidebarTrigger />
        </header>

        {/* Page Content */}
        <main className="overflow-auto p-4 min-h-0 bg-background">{children}</main>

        {/* Footer */}
        <footer className="h-10 px-4 py-2 border-t text-sm text-muted-foreground">
          <a href="https://github.com/omega3jung/sunghwan-portal">
            © 2025 SungHwan Jung.
          </a>
        </footer>

        {/* Demo Overlay */}
        {session.data?.user?.permission.scope === "LOCAL" && (
          <>
            <div className="absolute top-0 left-0 w-full h-full border-2 border-orange-400 z-[-1]"></div>
            <div className="absolute bottom-2 right-4 text-xl font-bold text-orange-400">
              Demo
            </div>
          </>
        )}
      </div>
    </ProtectedProviders>
  );
}
