// app/(protected)/layout.tsx
"use client";

import { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { useCurrentSession } from "@/hooks/useCurrentSession";
import { LeftMenu } from "@/components/layout/LeftMenu";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import I18nProvider from "@/components/layout/I18nProvider/I18nProvider";

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
    <I18nProvider namespaces={["common", "home"]}>
      {children}
      <SidebarProvider className="flex h-full">
        {/* Left Menu */}
        <LeftMenu></LeftMenu>

        {/* Right Main Screen */}
        <div className="grid grid-rows-[auto_1fr_auto] h-full w-full min-h-0">
          {/* Top Navigation */}
          <header className="h-14 flex items-center">
            <SidebarTrigger />
          </header>

          {/* Page Content */}
          <main className="overflow-auto p-4 min-h-0">{children}</main>

          <footer className="h-12 p-4 border-t text-sm text-muted-foreground">
            © 2025 SungHwan Jung.
            <a href="https://github.com/omega3jung/sunghwan-portal"></a>
          </footer>
        </div>
      </SidebarProvider>
    </I18nProvider>
  );
}
