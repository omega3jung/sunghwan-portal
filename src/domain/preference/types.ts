import { ColorTheme, Locale, Preference, ScreenMode } from "@/domain/config";
import { PreferencePatch } from "@/lib/preferenceStore";

export type UseCurrentPreferenceResult = {
  status: "loading" | "ready";
  current: Preference;

  setLanguage: (language: Locale) => void;
  setColorTheme: (theme: ColorTheme) => void;
  setScreenMode: (mode: ScreenMode) => void;

  updatePreference: (patch: PreferencePatch, force?: boolean) => Promise<void>;
  hydratePreference: () => void;
  clearPreference: () => void;
};
