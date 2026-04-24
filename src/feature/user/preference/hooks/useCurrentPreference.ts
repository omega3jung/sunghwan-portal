import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { useEffect } from "react";

import { ColorTheme, ScreenMode } from "@/domain/config";
import {
  createDefaultPreference,
  UseCurrentPreferenceResult,
} from "@/domain/user/preference";
import { useLanguageState } from "@/feature/user/preference/hooks/useLanguage";
import { PreferencePatch, usePreferenceStore } from "@/lib/preferenceStore";
import { Locale } from "@/shared/types";
import { applyColorTheme } from "@/shared/utils";

import { userPreferenceRepo } from "../repo";

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

  const { setTheme } = useTheme();
  const { language, changeLanguage } = useLanguageState();

  /*
   * From here on, authenticated is guaranteed at the type level.
   *
   * Processing session data for direct use in the UI.
   *
   * Principles:
   * - Eliminate calculation logic from page/component.
   * - Only update this hook when the session data structure changes.
   */
  const current = store ?? createDefaultPreference();

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
    updatePreference({ language });
    changeLanguage(language);
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
    updatePreference({ colorTheme });
    applyColorTheme(colorTheme);
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
    updatePreference({ screenMode });
    setTheme(screenMode);
  };

  // hydrate once on mount (restore sessionStorage -> store)
  useEffect(() => {
    store.hydratePreference();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // set session when sign in.
  useEffect(() => {
    if (session.status !== "authenticated") return;
    if (!session.data?.user) return;

    const remoteId =
      session.data?.user.dataScope === "LOCAL" ? null : session.data?.user.id;

    userPreferenceRepo.get(remoteId).then((preference) => {
      store.setPreference(preference);
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.status, session.data?.user]);

  // color theme
  useEffect(() => {
    if (!store.colorTheme) return;
    applyColorTheme(store.colorTheme);
  }, [store.colorTheme]);

  // screen mode (light / dark)
  useEffect(() => {
    if (!store.screenMode) return;
    setTheme(store.screenMode);
  }, [setTheme, store.screenMode]);

  // language
  useEffect(() => {
    if (!store.language || store.language === language) return;
    changeLanguage(store.language);
  }, [changeLanguage, language, store.language]);

  // clear session and impersonation when sign out.
  useEffect(() => {
    if (session.status === "unauthenticated") {
      store.clearPreference();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.status]);

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
