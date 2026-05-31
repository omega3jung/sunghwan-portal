import { ColorTheme, PortalPreference, ScreenMode } from "@/domain/config";
import { PreferencePatch } from "@/lib/preferenceStore";
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
