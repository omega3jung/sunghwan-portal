"use client";

import { useEffect } from "react";

import { usePreferenceStore } from "@/lib/preferenceStore";

// hydrate once on mount (restore sessionStorage -> store)
export function usePreferenceHydration() {
  const hydratePreference = usePreferenceStore(
    (state) => state.hydratePreference,
  );

  useEffect(
    () => {
      hydratePreference();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
}
