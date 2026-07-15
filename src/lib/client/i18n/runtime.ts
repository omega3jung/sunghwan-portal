"use client";

import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import {
  DEFAULT_LANGUAGE,
} from "@/lib/application/i18n";
import { en } from "@/lib/application/i18n/locales/en";
import { es } from "@/lib/application/i18n/locales/es";
import { fr } from "@/lib/application/i18n/locales/fr";
import { ko } from "@/lib/application/i18n/locales/ko";

// init i18next for all options read: https://www.i18next.com/overview/configuration-options
i18n.use(initReactI18next).init({
  lng: DEFAULT_LANGUAGE,
  fallbackLng: DEFAULT_LANGUAGE,

  ns: ["common", "login"],
  defaultNS: "common",

  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
  resources: {
    en,
    es,
    fr,
    ko,
  },
});

export default i18n;
