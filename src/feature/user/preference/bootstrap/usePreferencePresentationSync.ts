"use client";

import { useTheme } from "next-themes";
import { useEffect } from "react";

import { useLanguageState } from "@/feature/user/preference/hooks/useLanguage";
import { usePreferenceStore } from "@/lib/preferenceStore";
import { applyColorTheme } from "@/shared/utils/presentation";

export function usePreferencePresentationSync() {
  const colorTheme = usePreferenceStore((state) => state.colorTheme);
  const screenMode = usePreferenceStore((state) => state.screenMode);
  const storeLanguage = usePreferenceStore((state) => state.language);

  const { setTheme } = useTheme();
  const { language, changeLanguage } = useLanguageState();

  // color theme
  useEffect(() => {
    if (!colorTheme) return;
    applyColorTheme(colorTheme);
  }, [colorTheme]);

  // screen mode (light / dark)
  useEffect(() => {
    if (!screenMode) return;
    setTheme(screenMode);
  }, [screenMode, setTheme]);

  // language
  useEffect(() => {
    if (!storeLanguage || storeLanguage === language) return;
    changeLanguage(storeLanguage);
  }, [storeLanguage, language, changeLanguage]);
}
