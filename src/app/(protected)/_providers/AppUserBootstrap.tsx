// (protected)/_providers/AppUserBootstrap.tsx
"use client";

import { useEffect, useRef } from "react";

import { useAppUser } from "@/hooks/useAppUser";
import { useImpersonationStore } from "@/lib/impersonationStore";

type Props = {
  userId: string;
  children: React.ReactNode;
};

export function AppUserBootstrap({ userId, children }: Props) {
  const impersonation = useImpersonationStore();
  const initializedRef = useRef(false);

  const appUserQuery = useAppUser(userId);

  useEffect(() => {
    if (!userId) return;
    if (initializedRef.current) return;

    if (!appUserQuery.data) return;

    impersonation.syncFromSession({
      actor: appUserQuery.data,
      subject: null,
    });

    initializedRef.current = true;
  }, [userId, appUserQuery.data]);

  return <>{children}</>;
}
