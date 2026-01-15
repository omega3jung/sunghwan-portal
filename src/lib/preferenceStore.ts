import { create } from "zustand";

import { defaultPreference } from "@/domain/user";
import { ColorTheme, Locale, Preference, ScreenMode } from "@/types";

/*
 * =========================================================
 * Preference Store (zustand)
 * ---------------------------------------------------------
 * Role:
 * - Manages user-specific preferences scoped to auth session
 * - Hydrated from server on login
 * - Reset when user changes or logs out
 * - Persisted in sessionStorage
 * =========================================================
 */

const STORAGE_KEYS = {
  SESSION: "sunghwan_portal_preference",
} as const;

/*
 * Minimum state stored in the session
 * - screenMode: light | dark | system
 * - colorTheme: default | emerald | ruby | sapphire | topaz
 * - language: en | es | fr | ko
 */

export type PreferencePatch = Partial<Preference> & {
  screenMode?: Partial<ScreenMode> | null;
  colorTheme?: Partial<ColorTheme> | null;
  language?: Partial<Locale> | null;
};

/*
 * Actions that manipulate session state
 *
 * Naming conventions:
 * - hydratePreference: Recovers storage from memory
 * - setPreference: Updates the session (partial refresh)
 * - clearPreference: Logs out / clears the session
 */
export interface PreferenceActions {
  hydratePreference: () => void; // sessionStorage → store
  setPreference: (patch: PreferencePatch) => void; // store + storage synchronization
  clearPreference: () => void; // logout / clear session
}

/*
 * Actual zustand store
 */
export const usePreferenceStore = create<Preference & PreferenceActions>()(
  (set, get) => ({
    ...defaultPreference,

    /**
     * Called when the app starts
     * Restores values ​​stored in sessionStorage to memory
     */
    hydratePreference: () => {
      try {
        const raw = sessionStorage.getItem(STORAGE_KEYS.SESSION);
        if (!raw) return;

        const parsed = JSON.parse(raw) as Preference;
        set(parsed);
      } catch {
        set(defaultPreference);
      }
    },

    /**
     * Update session information
     * NOTE: setPreference performs a shallow merge.
     * Nested preference objects are replaced entirely.
     */
    setPreference: (patch) => {
      const prev = get();

      const next: Preference = {
        ...prev,
        ...patch,
      };

      sessionStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(next));
      set(next);
    },

    /**
     * Called upon logout
     * - Clears all sessionStorage
     * - Resets memory state
     */
    clearPreference: () => {
      sessionStorage.removeItem(STORAGE_KEYS.SESSION);
      set(defaultPreference);
    },
  })
);
