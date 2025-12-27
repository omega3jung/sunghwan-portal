import { ValueLabel } from "@/types/common";

export type Locale = "en" | "es" | "fr" | "ko";
export const SUPPORTED_LANGUAGES: Locale[] = ["en", "ko", "fr", "es"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: SupportedLanguage = "en";

export const AvailableLanguages: ValueLabel<SupportedLanguage>[] = [
  { label: "English", value: "en" },
  { label: "한국어", value: "ko" },
  { label: "Français", value: "fr" },
  { label: "Español", value: "es" },
];
