import { detectBrowserLanguage } from "@/lib/i18n/detectLanguage";
import { Preference } from "@/types";

export const defaultPreference: Preference = {
  screenMode: "system",
  colorTheme: "default",
  language: detectBrowserLanguage(),
};
