import { Locale } from "@/shared/types";

export const SUPPORTED_LANGUAGES: Locale[] = ["en", "ko", "fr", "es"] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: SupportedLanguage = "en";

/**
 * Checks whether a string matches one of the application's supported locale codes.
 *
 * Use for:
 * - Narrowing dynamic route params to the `Locale` type
 * - Validating user-selected language values before use
 *
 * @param value - The string value to validate as a supported locale
 * @returns `true` when the value is a supported locale, otherwise `false`
 */
export const isLocale = (value: string): value is Locale => {
  return SUPPORTED_LANGUAGES.includes(value as Locale);
};
