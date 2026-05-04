// src/shared/i18n/dateLocaleMap.ts

import type { Locale as DateFnsLocale } from "date-fns";
import { enUS, es, fr, ko } from "date-fns/locale";

import { Locale } from "../types";

export const dateLocaleMap: Record<Locale, DateFnsLocale> = {
  en: enUS,
  es,
  fr,
  ko,
};
