import { Preference } from "@/domain/config";
import { detectBrowserLanguage } from "@/lib/i18n/detectLanguage";

export function createDefaultPreference(): Preference {
  return {
    screenMode: "system",
    colorTheme: "default",
    language: detectBrowserLanguage(),
  };
}
