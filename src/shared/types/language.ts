import { Locale } from "./locale";

/** English-required value with optional translations for supported locales. */
export type Localized<T> = {
  en: T;
} & Partial<Record<Exclude<Locale, "en">, T>>;

/** Localized plain-text value used across domain and presentation boundaries. */
export type LocalizedText = Localized<string>;
