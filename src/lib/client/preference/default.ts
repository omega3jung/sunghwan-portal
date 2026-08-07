import type { PortalPreference } from "@/domain/user/preference";

import { detectBrowserLanguage } from "../i18n/detectLanguage";

/** Creates a fresh browser preference snapshot using supported presentation defaults. */
export function createDefaultPreference(): PortalPreference {
  return {
    menu: "collapsible",
    screenMode: "system",
    colorTheme: "default",
    language: detectBrowserLanguage(),
  };
}
