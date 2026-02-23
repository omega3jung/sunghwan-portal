import { SUPPORTED_LANGUAGES } from "@/app/config/language";

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: SupportedLanguage = "en";
