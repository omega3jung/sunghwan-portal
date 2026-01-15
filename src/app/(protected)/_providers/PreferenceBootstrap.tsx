"use client";

import { useCurrentPreference } from "@/hooks/useCurrentPreference";

export function PreferenceBootstrap() {
  const {} = useCurrentPreference();

  return null;
}
