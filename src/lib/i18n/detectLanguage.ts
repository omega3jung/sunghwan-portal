import {
  DEFAULT_LANGUAGE,
  SUPPORTED_LANGUAGES,
  SupportedLanguage,
} from "@/types";

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
