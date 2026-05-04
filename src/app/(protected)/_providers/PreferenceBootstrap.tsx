"use client";

import { useCurrentPreference } from "@/feature/user/preference/hooks/useCurrentPreference";

export function PreferenceBootstrap() {
  const {} = useCurrentPreference();

  return null;
}
