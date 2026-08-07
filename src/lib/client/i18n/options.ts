import { TFunction } from "i18next";

import { NS } from "@/lib/application/i18n";
import { Locale } from "@/shared/types";
import { ValueLabel } from "@/shared/types/options";

/** Locale choices displayed before a translator is available. */
export const languageOptions: ValueLabel<Locale>[] = [
  { label: "English", value: "en" },
  { label: "Español", value: "es" },
  { label: "Français", value: "fr" },
  { label: "한국어", value: "ko" },
];

/** Returns locale choices with labels translated by the supplied translator. */
export const getLanguageOptions = (t: TFunction): ValueLabel<Locale>[] => {
  return [
    { label: t("language.english", { ns: NS.settings }), value: "en" },
    { label: t("language.spanish", { ns: NS.settings }), value: "es" },
    { label: t("language.french", { ns: NS.settings }), value: "fr" },
    { label: t("language.korean", { ns: NS.settings }), value: "ko" },
  ];
};
