import { Locale } from "@/shared/types";

/** Represents screen mode within the user domain. */
export type ScreenMode = "light" | "dark" | "system";
/** Represents color theme within the user domain. */
export type ColorTheme = "default" | "emerald" | "ruby" | "sapphire" | "topaz";
/** Represents menu mode within the user domain. */
export type MenuMode = "collapsible" | "group";

/** Represents preference within the user domain. */
export interface Preference<T> {
  preferenceKey: string;
  preferenceMeta: T;
}

/** Represents portal preference within the user domain. */
export interface PortalPreference {
  menu: MenuMode;
  screenMode: ScreenMode;
  colorTheme: ColorTheme;
  language: Locale;
}
