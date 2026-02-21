import { Locale } from "./language";
import { ColorTheme, ScreenMode } from "./ui.types";

export interface Preference {
  screenMode: ScreenMode;
  colorTheme: ColorTheme;
  language: Locale;
}
