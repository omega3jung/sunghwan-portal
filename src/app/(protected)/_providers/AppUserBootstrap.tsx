// (protected)/_providers/AppUserBootstrap.tsx
"use client";

import { useEffect, useRef } from "react";

import { useAppUser } from "@/hooks/useAppUser";
import { useFetchUserPreference } from "@/hooks/useUserPreference";
import { useImpersonationStore } from "@/lib/impersonationStore";
import { AuthUser } from "@/types/next-auth";

type Props = {
  user: AuthUser;
  children: React.ReactNode;
};

export function AppUserBootstrap({ user, children }: Props) {
  const impersonation = useImpersonationStore();
  const initializedRef = useRef(false);

  const appUserQuery = useAppUser(user.id);
  const preferenceQuery = useFetchUserPreference();

  useEffect(() => {
    if (!user.id) return;
    if (initializedRef.current) return;

    // demo user
    if (user.id === "demo") {
      impersonation.setActor({
        ...user,
        permission: "GUEST",
        preference: preferenceQuery.data,
        canUseSuperUser: false,
      });
      initializedRef.current = true;
      return;
    }

    if (!appUserQuery.data) return;

    impersonation.setActor({
      ...appUserQuery.data,
      preference: preferenceQuery.data,
    });

    initializedRef.current = true;
  }, [user, appUserQuery.data, preferenceQuery.data]);

  return <>{children}</>;
}
