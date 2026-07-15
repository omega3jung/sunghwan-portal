"use client";

import { useState } from "react";

import { useCurrentPreference } from "@/feature/user/preference/client";
import type { Locale } from "@/shared/types";

export function useServiceDeskSettingsLanguage() {
  const { current: userPreference } = useCurrentPreference();
  const [language, setLanguage] = useState<Locale>(userPreference.language);

  return {
    language,
    setLanguage,
  };
}
