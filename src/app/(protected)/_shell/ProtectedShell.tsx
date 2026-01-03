"use client";

import { Loader2 } from "lucide-react";
import { redirect } from "next/navigation";

import { LeftMenu } from "@/components/layout/LeftMenu";
import { NavigationBar } from "@/components/layout/NavigationBar";
import { Button } from "@/components/ui/button";
import { useCurrentSession } from "@/hooks/useCurrentSession";
import { withLeadingSlash } from "@/utils";

import { AppUserBootstrap } from "../_providers/AppUserBootstrap";

export function ProtectedShell({ children }: { children: React.ReactNode }) {
  const session = useCurrentSession();

  if (session.status === "loading") {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  if (session.status === "unauthenticated") {
    redirect(withLeadingSlash("/login"));
  }

  const isDemoUser = session.current?.dataScope === "LOCAL";

  return (
    // UI root container (absolute overlays are positioned relative to this)
    <AppUserBootstrap user={session.current!.user}>
      {/* Demo Overlay */}
      {isDemoUser && <DemoOverlay />}

      {/* Left Menu */}
      <LeftMenu></LeftMenu>

      {/* Right Main Screen */}
      <div className="grid grid-rows-[auto_1fr_auto] h-screen w-screen min-h-0">
        {/* Top Navigation */}
        <NavigationBar className="h-[57px]" />

        {/* Page Content */}
        <main className="overflow-auto p-2 min-h-0 bg-background">
          {children}
        </main>

        {/* Footer */}
        <footer className="h-10 px-4 py-2 border-t flex items-center">
          <Button
            variant="link"
            className=" text-sm text-muted-foreground p-0 hover:underline"
            onClick={() =>
              window.open(
                "https://github.com/omega3jung/sunghwan-portal",
                "_blank"
              )
            }
          >
            © 2025 SungHwan Jung.
          </Button>
        </footer>
      </div>
    </AppUserBootstrap>
  );
}

const DemoOverlay = () => (
  <>
    <div className="absolute inset-0 border-2 border-orange-400 z-50 pointer-events-none" />
    <div className="absolute bottom-2 right-4 text-xl font-bold text-orange-400 z-50 pointer-events-none">
      Demo
    </div>
  </>
);
