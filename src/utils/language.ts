import { SUPPORTED_LANGUAGES } from "@/app/config/language";
import { Locale } from "@/shared/types";

export const isLocale = (value: string): value is Locale => {
  return SUPPORTED_LANGUAGES.includes(value as Locale);
};
