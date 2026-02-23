import { DEFAULT_LANGUAGE } from "@/domain/config";
import { Locale, LocalizedText } from "@/shared/types";

export const getLocalizedText = (
  text: LocalizedText | undefined,
  language: Locale,
) => {
  if (!text) return "";

  const value = text[language];

  if (value !== undefined) return value;

  return text[DEFAULT_LANGUAGE];
};
