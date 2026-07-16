"use client";

import { Loader2 } from "lucide-react";
import { redirect } from "next/navigation";

import { RouteLoadingProvider } from "@/components/layout/RouteLoading";
import { Button } from "@/components/ui/button";
import { useCurrentSession } from "@/feature/auth/session/client";
import { LeftMenu } from "@/feature/navigation/leftMenu/client";
import {
  NavigationBar,
  NavigationBarProvider,
} from "@/feature/navigation/navigationBar/client";
import { withLeadingSlash } from "@/lib/config/routing";
import {
  clientAuths,
  clientProfiles,
  internalAuths,
  internalProfiles,
} from "@/mocks/domain/user";

import { AppUserBootstrap } from "../_providers/AppUserBootstrap";
import { PreferenceBootstrap } from "../_providers/PreferenceBootstrap";
import { SessionStatusOverlay } from "./SessionStatusOverlay";

const userMenuDemoCandidates = {
  auths: {
    internal: internalAuths,
    client: clientAuths,
  },
  profiles: {
    internal: internalProfiles,
    client: clientProfiles,
  },
};

export function ProtectedShell({ children }: { children: React.ReactNode }) {
  const session = useCurrentSession();

  // 1️⃣ next-auth loading
  if (session.status === "loading" && !session.current) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  // 2️⃣ not authenticated
  if (session.status === "unauthenticated") {
    redirect(withLeadingSlash("/login"));
  }

  // 3️⃣ authenticated BUT AppUser not hydrated yet
  if (!session.current || !session.current.user) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  const isDemoUser = session.current.isDemoUser;
  const isImpersonating = !!session.data?.impersonation?.impersonatedUser;

  return (
    // UI root container (absolute overlays are positioned relative to this)
    <AppUserBootstrap user={session.current?.user}>
      <RouteLoadingProvider>
        {/* All user preferences are automatically applied */}
        <PreferenceBootstrap />

        <SessionStatusOverlay
          isDemoUser={isDemoUser}
          isImpersonating={isImpersonating}
        />

        {/* Left Menu */}
        <LeftMenu></LeftMenu>

        <NavigationBarProvider>
          {/* Right Main Screen */}
          <div className="grid grid-rows-[auto_1fr_auto] h-screen w-screen min-h-0">
            {/* Top Navigation */}
            <NavigationBar
              className="h-[57px]"
              userMenuDemoCandidates={userMenuDemoCandidates}
            />

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
                    "_blank",
                  )
                }
              >
                © 2025 Sunghwan Jung.
              </Button>
            </footer>
          </div>
        </NavigationBarProvider>
      </RouteLoadingProvider>
    </AppUserBootstrap>
  );
}
