import { Locale, SUPPORTED_LANGUAGES } from "@/types";

export const isLocale = (value: string): value is Locale => {
  return SUPPORTED_LANGUAGES.includes(value as Locale);
};
