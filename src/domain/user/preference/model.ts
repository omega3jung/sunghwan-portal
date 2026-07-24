import { Locale } from "@/shared/types";

export type ScreenMode = "light" | "dark" | "system";
export type ColorTheme = "default" | "emerald" | "ruby" | "sapphire" | "topaz";

export interface Preference<T> {
  preferenceKey: string;
  preferenceMeta: T;
}

export interface PortalPreference {
  screenMode: ScreenMode;
  colorTheme: ColorTheme;
  language: Locale;
}
