import type { PortalPreference } from "@/domain/user/preference";

import { detectBrowserLanguage } from "./i18n/detectLanguage";

export function createDefaultPreference(): PortalPreference {
  return {
    screenMode: "system",
    colorTheme: "default",
    language: detectBrowserLanguage(),
  };
}
