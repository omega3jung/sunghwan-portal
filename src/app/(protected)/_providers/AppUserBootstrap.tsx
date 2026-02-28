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
  const impersonation = useImpersonationStore();

  useEffect(() => {
    if (!user) return;

    // 🔑 Do not overwrite actor while impersonating
    if (impersonation.subject) return;

    // 🔑 If it's already the same actor, there's no need to sync again.
    if (impersonation.actor?.id === user.id) return;

    impersonation.syncFromSession({
      actor: user,
      subject: null,
    });
  }, [user, impersonation.subject]);

  return <>{children}</>;
}
