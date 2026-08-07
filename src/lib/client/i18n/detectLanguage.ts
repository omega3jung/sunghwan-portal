import {
  DEFAULT_LANGUAGE,
  SUPPORTED_LANGUAGES,
  SupportedLanguage,
} from "@/lib/application/i18n";

/**
 * Resolves the first supported base language advertised by the browser.
 *
 * Region suffixes such as `ko-KR` are intentionally collapsed to the project's
 * language-only locale keys. Server rendering and unsupported browser locales
 * fall back to `DEFAULT_LANGUAGE` rather than throwing.
 */
export function detectBrowserLanguage(): SupportedLanguage {
  if (typeof navigator === "undefined") {
    return DEFAULT_LANGUAGE;
  }

  const candidates = navigator.languages ?? [navigator.language];

  for (const lang of candidates) {
    // "ko-KR" → "ko"
    const normalized = lang.toLowerCase().split("-")[0];

    if (SUPPORTED_LANGUAGES.includes(normalized as SupportedLanguage)) {
      return normalized as SupportedLanguage;
    }
  }

  return DEFAULT_LANGUAGE;
}
