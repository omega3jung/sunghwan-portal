import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { en } from "./locales/en";
import { es } from "./locales/es";
import { fr } from "./locales/fr";
import { ko } from "./locales/ko";
import { dateRangePickerLocales } from "@/components/custom/DateRangePicker/locales";
import { stepperLocales } from "@/components/custom/Stepper";
import { supportedLocales } from "@/lib/i18n/types";

// init i18next for all options read: https://www.i18next.com/overview/configuration-options
i18n.use(initReactI18next).init({
  fallbackLng: "en",
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

supportedLocales.forEach((lng) => {
  i18n.addResourceBundle(
    lng,
    "DateRangePicker",
    dateRangePickerLocales[lng],
    true,
    false
  );
});

supportedLocales.forEach((lng) => {
  i18n.addResourceBundle(lng, "Stepper", stepperLocales[lng], true, false);
});

export default i18n;
