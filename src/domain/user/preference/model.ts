import { ColorTheme, ScreenMode } from "@/domain/config";
import { Locale } from "@/shared/types";

export interface Preference<T> {
  preferenceKey: string;
  preferenceMeta: T;
}

export interface PortalPreference {
  screenMode: ScreenMode;
  colorTheme: ColorTheme;
  language: Locale;
}
