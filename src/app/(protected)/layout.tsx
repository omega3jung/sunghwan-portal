// app/(protected)/layout.tsx
"use client";

import { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { useCurrentSession } from "@/hooks/useCurrentSession";
import { LeftMenu } from "@/components/layout/LeftMenu";
import { NavigationBar } from "@/components/layout/NavigationBar";
import { ProtectedProviders } from "./_providers";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import { redirect } from "next/navigation";

// force-dynamic to block cache store.
//export const dynamic = "force-dynamic";
//export const revalidate = 0;

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const session = useCurrentSession();
  const isDemoUser = session.current.dataScope === "LOCAL";

  const testSignOut = function () {
    signOut();
  };

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

  // 👇 여기서부터는 authenticated 보장.
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
        <NavigationBar
          className="h-14"
          actions={
            <Button
              className="rounded-lg text-base font-normal w-full"
              type="button"
              onClick={testSignOut}
            >
              logout
            </Button>
          }
        />

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
