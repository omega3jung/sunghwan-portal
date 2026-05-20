import { create } from "zustand";

import { ColorTheme, PortalPreference, ScreenMode } from "@/domain/config";
import { createDefaultPreference } from "@/domain/user/preference";
import { Locale } from "@/shared/types";

const STORAGE_KEYS = {
  SESSION: "sunghwan_portal_preference",
} as const;

/*
 * Minimum state stored in the session
 * - screenMode: light | dark | system
 * - colorTheme: default | emerald | ruby | sapphire | topaz
 * - language: en | es | fr | ko
 */
export type PreferencePatch = Partial<PortalPreference> & {
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
  hydratePreference: () => void;
  setPreference: (patch: PreferencePatch) => void;
  clearPreference: () => void;
}

/**
 * Creates the client-side preference store and persists preference state in `sessionStorage`.
 *
 * Use for:
 * - Reading and updating user-specific UI preferences from React components
 * - Hydrating, patching, and clearing persisted preference state through a shared Zustand store
 *
 * @param none - This store hook does not accept any arguments
 * @returns A Zustand hook exposing preference state together with preference management actions
 */
export const usePreferenceStore = create<
  PortalPreference & PreferenceActions
>()((set, get) => ({
  ...createDefaultPreference(),

  /**
   * Restores preference state from `sessionStorage` into the in-memory store.
   *
   * Use for:
   * - Hydrating stored preferences when the client application starts
   * - Recovering persisted UI settings after browser navigation
   *
   * @param none - This action does not accept any arguments
   * @returns Nothing; the function updates the store with restored or default preference values
   */
  hydratePreference: () => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEYS.SESSION);
      if (!raw) return;

      const parsed = JSON.parse(raw) as PortalPreference;
      set(parsed);
    } catch {
      set(createDefaultPreference());
    }
  },

  /**
   * Applies a partial preference update and synchronizes the result to `sessionStorage`.
   *
   * Use for:
   * - Updating selected preference fields without replacing the entire preference object
   * - Persisting UI preference changes such as language or theme selection
   *
   * @param patch - The partial preference fields to merge into the current preference state
   * @returns Nothing; the function writes the merged preference state to storage and the store
   */
  setPreference: (patch) => {
    const prev = get();

    const next: PortalPreference = {
      ...prev,
      ...patch,
    };

    sessionStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(next));
    set(next);
  },

  /**
   * Clears the persisted preference state and resets the store to its default values.
   *
   * Use for:
   * - Removing user preference data during logout
   * - Resetting client preference state when the active user changes
   *
   * @param none - This action does not accept any arguments
   * @returns Nothing; the function removes stored preferences and restores defaults
   */
  clearPreference: () => {
    sessionStorage.removeItem(STORAGE_KEYS.SESSION);
    set(createDefaultPreference());
  },
}));
