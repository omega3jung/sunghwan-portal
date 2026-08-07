"use client";

import { useTheme } from "next-themes";
import { useEffect } from "react";

import { useLanguageState } from "@/feature/user/preference/hooks/useLanguage";
import { usePreferenceStore } from "@/lib/client/preference";
import { applyColorTheme } from "@/lib/client/theme";

/** Applies persisted language, theme, and screen mode to their client presentation runtimes. */
export function usePreferencePresentationSync() {
  const colorTheme = usePreferenceStore((state) => state.colorTheme);
  const screenMode = usePreferenceStore((state) => state.screenMode);
  const storeLanguage = usePreferenceStore((state) => state.language);

  const { setTheme } = useTheme();
  const { language, changeLanguage } = useLanguageState();

  useEffect(() => {
    if (!colorTheme) return;
    applyColorTheme(colorTheme);
  }, [colorTheme]);

  useEffect(() => {
    if (!screenMode) return;
    setTheme(screenMode);
  }, [screenMode, setTheme]);

  useEffect(() => {
    if (!storeLanguage || storeLanguage === language) return;
    changeLanguage(storeLanguage);
  }, [storeLanguage, language, changeLanguage]);
}
