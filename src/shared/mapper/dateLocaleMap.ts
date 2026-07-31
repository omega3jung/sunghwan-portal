// src/shared/mapper/dateLocaleMap.ts

import type { Locale as DateFnsLocale } from "date-fns";
import { enUS, es, fr, ko } from "date-fns/locale";

import { Locale } from "../types";

/** Maps application locale codes to their date-fns formatting locale. */
export const dateLocaleMap: Record<Locale, DateFnsLocale> = {
  en: enUS,
  es,
  fr,
  ko,
};
