import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import { dateRangePickerLocales } from "@/components/custom/DateRangePicker/locales";
import { stepperLocales } from "@/components/custom/Stepper";
import { leftMenuLocales } from "@/components/layout/LeftMenu/locales";
import { preferencesMenuLocales } from "@/components/menu/PreferencesMenu/locales";
import { userMenuLocales } from "@/components/menu/UserMenu/locales";
import { SUPPORTED_LANGUAGES } from "@/types";

import { detectBrowserLanguage } from "./detectLanguage";
import { en } from "./locales/en";
import { es } from "./locales/es";
import { fr } from "./locales/fr";
import { ko } from "./locales/ko";

const lang = detectBrowserLanguage();

// init i18next for all options read: https://www.i18next.com/overview/configuration-options
i18n.use(initReactI18next).init({
  lng: lang,
  fallbackLng: lang,

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

SUPPORTED_LANGUAGES.forEach((lng) => {
  i18n.addResourceBundle(
    lng,
    "DateRangePicker",
    dateRangePickerLocales[lng],
    true,
    false
  );
});

// add custom component locales.

// DateRangePicker.
SUPPORTED_LANGUAGES.forEach((lng) => {
  i18n.addResourceBundle(
    lng,
    "DateRangePicker",
    dateRangePickerLocales[lng],
    true,
    false
  );
});

// Stepper.
SUPPORTED_LANGUAGES.forEach((lng) => {
  i18n.addResourceBundle(lng, "Stepper", stepperLocales[lng], true, false);
});

// Left Menu.
SUPPORTED_LANGUAGES.forEach((lng) => {
  i18n.addResourceBundle(lng, "LeftMenu", leftMenuLocales[lng], true, false);
});

// Navigation Bar.
SUPPORTED_LANGUAGES.forEach((lng) => {
  i18n.addResourceBundle(lng, "Stepper", stepperLocales[lng], true, false);
});

// Preferences Menu.
SUPPORTED_LANGUAGES.forEach((lng) => {
  i18n.addResourceBundle(
    lng,
    "PreferencesMenu",
    preferencesMenuLocales[lng],
    true,
    false
  );
});

// User Menu.
SUPPORTED_LANGUAGES.forEach((lng) => {
  i18n.addResourceBundle(lng, "UserMenu", userMenuLocales[lng], true, false);
});

export default i18n;
