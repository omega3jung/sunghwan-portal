"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";

import { usePreferenceStore } from "@/lib/preferenceStore";

// clear session and impersonation when sign out.
export function usePreferenceCleanup() {
  const session = useSession();
  const clearPreference = usePreferenceStore((state) => state.clearPreference);

  useEffect(
    () => {
      if (session.status === "unauthenticated") {
        clearPreference();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [session.status],
  );
}
