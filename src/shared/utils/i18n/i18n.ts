import { DEFAULT_LANGUAGE } from "@/domain/config";
import { Locale, LocalizedText } from "@/shared/types";

/**
 * Returns localized text for a requested language with a fallback to the default language.
 *
 * Use for:
 * - Rendering translated labels from multi-language content objects
 * - Safely reading localized values when some languages are missing
 *
 * @param text - The localized text object keyed by locale codes
 * @param language - The preferred locale to read from the localized text object
 * @returns The text for the requested language, the default language fallback, or an empty string when no text is provided
 */
export const getLocalizedText = (
  text: LocalizedText | undefined,
  language: Locale,
) => {
  if (!text) return "";

  const value = text[language];

  if (value !== undefined) return value;

  return text[DEFAULT_LANGUAGE];
};
