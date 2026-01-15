import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { useEffect } from "react";

import { defaultPreference } from "@/domain/user";
import { userPreferenceRepo } from "@/feature/user/preference/repo";
import { PreferencePatch, usePreferenceStore } from "@/lib/preferenceStore";
import { useLanguageState } from "@/services/language";
import {
  ColorTheme,
  Locale,
  ScreenMode,
  UseCurrentPreferenceResult,
} from "@/types";
import { applyColorTheme } from "@/utils";

/*
 * =========================================================
 * useCurrentSession Hook
 * ---------------------------------------------------------
 * Role:
 * - Combines next-auth session + sessionStore (zustand)
 * - Processes it into a form suitable for use in UI/pages
 *
 * Purpose of this hook:
 * ❌ Prevents direct access to sessionStorage
 * ❌ Prevents direct access to the zustand store
 * ✅ Focuses solely on "how to use the session"
 *
 * In other words, a session facade (middle layer) for the frontend
 * =======================================================================================
 */

export const useCurrentPreference = (): UseCurrentPreferenceResult => {
  /*
   * next-auth session.
   * - authorization status (loading, authenticated / unauthenticated)
   * - expires
   */
  const session = useSession();

  /*
   * zustand session store.
   * - dataScope
   * - isSuperUser
   * - user: { id, name, email, dataScope }
   * - accessToken
   */
  const store = usePreferenceStore();

  const { theme, setTheme } = useTheme();
  const { language, changeLanguage } = useLanguageState();

  /*
   * 🔒 From here on, authenticated is guaranteed at the type level.
   *
   * Processing session data for direct use in the UI.
   *
   * Principles:
   * - Eliminate calculation logic from page/component.
   * - Only update this hook when the session data structure changes.
   */
  const current = store ?? defaultPreference;

  const status = session.status === "loading" ? "loading" : "ready";
  /*
   * Single entry point for session updates
   *
   * force = true:
   * - Force revalidation of the next-auth session
   * - Renew the zustand session afterward
   */
  const updatePreference = async (patch: PreferencePatch, force = false) => {
    if (force) {
      await session.update();
    }
    store.setPreference(patch);
  };

  const setLanguage = (language: Locale) => {
    updatePreference({ language });
    changeLanguage(language);
  };

  const setColorTheme = (colorTheme: ColorTheme) => {
    updatePreference({ colorTheme });
    applyColorTheme(colorTheme);
  };

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

    userPreferenceRepo.fetch(remoteId).then((preference) => {
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
  }, [store.screenMode]);

  // language
  useEffect(() => {
    if (!store.language) return;
    changeLanguage(store.language);
  }, [store.language]);

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
