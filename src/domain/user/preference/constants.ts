import { PortalPreference } from "@/domain/config";
import { detectBrowserLanguage } from "@/lib/i18n/detectLanguage";

export function createDefaultPreference(): PortalPreference {
  return {
    screenMode: "system",
    colorTheme: "default",
    language: detectBrowserLanguage(),
  };
}
