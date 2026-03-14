import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import { SUPPORTED_LANGUAGES } from "@/app/config/language";
import { datePickerLocales } from "@/components/custom/DatePicker/locales";
import { leftMenuLocales } from "@/components/layout/LeftMenu/locales";
import { preferencesMenuLocales } from "@/components/menu/PreferencesMenu/locales";
import { userMenuLocales } from "@/components/menu/UserMenu/locales";
import { DEFAULT_LANGUAGE } from "@/domain/config";
import { statusBadgeLocales } from "@/shared/ui/StatusBadge/locales";

import { en } from "./locales/en";
import { es } from "./locales/es";
import { fr } from "./locales/fr";
import { ko } from "./locales/ko";

export * from "./namespace";

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

// add custom component locales.

// DatePicker and DateRangePicker.
SUPPORTED_LANGUAGES.forEach((lng) => {
  i18n.addResourceBundle(
    lng,
    "DatePicker",
    datePickerLocales[lng],
    true,
    false,
  );
});

// Left Menu.
SUPPORTED_LANGUAGES.forEach((lng) => {
  i18n.addResourceBundle(lng, "LeftMenu", leftMenuLocales[lng], true, false);
});

// Preferences Menu.
SUPPORTED_LANGUAGES.forEach((lng) => {
  i18n.addResourceBundle(
    lng,
    "PreferencesMenu",
    preferencesMenuLocales[lng],
    true,
    false,
  );
});

// User Menu.
SUPPORTED_LANGUAGES.forEach((lng) => {
  i18n.addResourceBundle(lng, "UserMenu", userMenuLocales[lng], true, false);
});

// Status Badge.
SUPPORTED_LANGUAGES.forEach((lng) => {
  i18n.addResourceBundle(
    lng,
    "StatusBadge",
    statusBadgeLocales[lng],
    true,
    false,
  );
});

export default i18n;
