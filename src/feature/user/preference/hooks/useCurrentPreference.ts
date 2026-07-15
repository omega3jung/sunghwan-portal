"use client";

import { useSession } from "next-auth/react";

import {
  ColorTheme,
  PortalPreference,
  ScreenMode,
} from "@/domain/user/preference";
import { PreferencePatch, usePreferenceStore } from "@/lib/preferenceStore";
import { Locale } from "@/shared/types";

export type UseCurrentPreferenceResult = {
  status: "loading" | "ready";
  current: PortalPreference;

  setLanguage: (language: Locale) => void;
  setColorTheme: (theme: ColorTheme) => void;
  setScreenMode: (mode: ScreenMode) => void;

  updatePreference: (patch: PreferencePatch, force?: boolean) => Promise<void>;
  hydratePreference: () => void;
  clearPreference: () => void;
};

/**
 * Combines session, preference store, theme state, and language state into a single preference facade for the UI.
 *
 * Use for:
 * - Reading the current user preference state from one hook
 * - Updating language, color theme, and screen mode without touching storage details directly
 *
 * @param none - This hook does not accept any arguments
 * @returns A preference facade containing the current preference state, readiness status, and update helpers
 */
export const useCurrentPreference = (): UseCurrentPreferenceResult => {
  /*
   * next-auth session.
   * - authorization status (loading, authenticated / unauthenticated)
   * - expires
   */
  const session = useSession();

  /*
   * zustand preference store.
   * - language
   * - colorTheme
   * - screenMode
   */
  const store = usePreferenceStore();
  const current = {
    language: store.language,
    colorTheme: store.colorTheme,
    screenMode: store.screenMode,
  };

  const status = session.status === "loading" ? "loading" : "ready";

  /**
   * Updates the preference store and optionally refreshes the server-backed session first.
   *
   * Use for:
   * - Applying partial preference changes from UI controls
   * - Revalidating the current session before synchronizing updated preference state
   *
   * @param patch - The partial preference values to merge into the current preference state
   * @param force - Whether to refresh the NextAuth session before writing to the local store
   * @returns A promise that resolves after any requested session refresh and store update complete
   */
  const updatePreference = async (patch: PreferencePatch, force = false) => {
    if (force) {
      await session.update();
    }

    store.setPreference(patch);
  };

  /**
   * Updates the active language in both the preference store and the i18n runtime.
   *
   * Use for:
   * - Applying a newly selected locale from the UI
   * - Keeping persisted preference state aligned with the active translation language
   *
   * @param language - The locale code to persist and activate
   * @returns Nothing; the function triggers preference and i18n updates
   */
  const setLanguage = (language: Locale) => {
    store.setPreference({ language });
  };

  /**
   * Updates the stored color theme and immediately applies it to the document.
   *
   * Use for:
   * - Persisting a newly selected color theme
   * - Synchronizing stored preference state with the active DOM theme attribute
   *
   * @param colorTheme - The color theme to store and apply
   * @returns Nothing; the function updates preference state and the document theme
   */
  const setColorTheme = (colorTheme: ColorTheme) => {
    store.setPreference({ colorTheme });
  };

  /**
   * Updates the stored screen mode and applies it through the theme provider.
   *
   * Use for:
   * - Switching between light and dark screen modes
   * - Persisting screen mode choices in the preference store
   *
   * @param screenMode - The screen mode to store and activate
   * @returns Nothing; the function updates preference state and the active theme mode
   */
  const setScreenMode = (screenMode: ScreenMode) => {
    store.setPreference({ screenMode });
  };

  return {
    status,
    current,
    setLanguage,
    setColorTheme,
    setScreenMode,
    updatePreference,
    hydratePreference: store.hydratePreference,
    clearPreference: store.clearPreference,
  };
};
