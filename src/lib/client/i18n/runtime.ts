"use client";

import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import { DEFAULT_LANGUAGE, NS } from "@/lib/application/i18n";
import { en } from "@/lib/application/i18n/locales/en";
import { es } from "@/lib/application/i18n/locales/es";
import { fr } from "@/lib/application/i18n/locales/fr";
import { ko } from "@/lib/application/i18n/locales/ko";

// This client singleton registers bundled resources without Suspense so route
// rendering does not depend on a separate translation-loading lifecycle.
i18n.use(initReactI18next).init({
  lng: DEFAULT_LANGUAGE,
  fallbackLng: DEFAULT_LANGUAGE,

  ns: Object.values(NS),
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

/** Initialized client-side i18next singleton with all bundled locale resources. */
export default i18n;
