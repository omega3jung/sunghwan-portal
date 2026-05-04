import { Locale } from "./locale";

export type Localized<T> = {
  en: T;
} & Partial<Record<Exclude<Locale, "en">, T>>;

export type LocalizedText = Localized<string>;
