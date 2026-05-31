// src/app/(protected)/_providers/AppUserBootstrap.tsx
"use client";

import { useEffect } from "react";

import { AppUser } from "@/domain/user";
import { useImpersonationStore } from "@/lib/impersonationStore";

type Props = {
  user: AppUser;
  children: React.ReactNode;
};

export function AppUserBootstrap({ user, children }: Props) {
  const impersonatedUser = useImpersonationStore(
    (state) => state.impersonatedUser,
  );
  const originalUsername = useImpersonationStore(
    (state) => state.originalUser?.username,
  );
  const syncFromSession = useImpersonationStore((state) => state.syncFromSession);

  useEffect(() => {
    if (!user) return;

    // Do not overwrite the original user while impersonation is active.
    if (impersonatedUser) return;

    if (originalUsername === user.username) return;

    syncFromSession({
      originalUser: user,
      impersonatedUser: null,
    });
  }, [impersonatedUser, originalUsername, syncFromSession, user]);

  return <>{children}</>;
}
