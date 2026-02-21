export type DefaultLocale = "en";
export type Locale = DefaultLocale | "es" | "fr" | "ko";
export const SUPPORTED_LANGUAGES: Locale[] = ["en", "ko", "fr", "es"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: SupportedLanguage = "en";
