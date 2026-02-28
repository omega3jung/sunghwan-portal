import { Locale } from "./locale";

export type LocalizedText = {
  en: string;
} & Partial<Record<Exclude<Locale, "en">, string>>;
