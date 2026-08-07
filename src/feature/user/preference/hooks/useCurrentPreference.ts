"use client";

import { useSession } from "next-auth/react";

import {
  ColorTheme,
  MenuMode,
  PortalPreference,
  ScreenMode,
} from "@/domain/user/preference";
import { PreferencePatch, usePreferenceStore } from "@/lib/client/preference";
import { Locale } from "@/shared/types";

export type UseCurrentPreferenceResult = {
  status: "loading" | "ready";
  current: PortalPreference;

  setMenu: (menu: MenuMode) => void;
  setLanguage: (language: Locale) => void;
  setColorTheme: (theme: ColorTheme) => void;
  setScreenMode: (mode: ScreenMode) => void;

  updatePreference: (patch: PreferencePatch, force?: boolean) => Promise<void>;
  hydratePreference: () => void;
  clearPreference: () => void;
};

/** Combines authenticated-session readiness with the local preference store. */
export const useCurrentPreference = (): UseCurrentPreferenceResult => {
  const session = useSession();

  const store = usePreferenceStore();
  const current = {
    menu: store.menu,
    language: store.language,
    colorTheme: store.colorTheme,
    screenMode: store.screenMode,
  };

  const status = session.status === "loading" ? "loading" : "ready";

  // `force` refreshes authentication first; persistence remains the store's responsibility.
  const updatePreference = async (patch: PreferencePatch, force = false) => {
    if (force) {
      await session.update();
    }

    store.setPreference(patch);
  };

  const setMenu = (menu: MenuMode) => {
    store.setPreference({ menu });
  };

  const setLanguage = (language: Locale) => {
    store.setPreference({ language });
  };

  const setColorTheme = (colorTheme: ColorTheme) => {
    store.setPreference({ colorTheme });
  };

  const setScreenMode = (screenMode: ScreenMode) => {
    store.setPreference({ screenMode });
  };

  return {
    status,
    current,
    setMenu,
    setLanguage,
    setColorTheme,
    setScreenMode,
    updatePreference,
    hydratePreference: store.hydratePreference,
    clearPreference: store.clearPreference,
  };
};
