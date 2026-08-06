"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { DEFAULT_LANGUAGE } from "@/lib/application/i18n";
import { isLocale } from "@/lib/application/i18n";
import { Locale } from "@/shared/types";

const resolveLocale = (value?: string): Locale => {
  return value && isLocale(value) ? value : DEFAULT_LANGUAGE;
};

/** Keeps React state and the document language aligned with i18next events. */
export function useLanguageState() {
  const { i18n } = useTranslation();
  const [language, setLanguage] = useState<Locale>(() =>
    resolveLocale(i18n.resolvedLanguage ?? i18n.language),
  );

  useEffect(() => {
    const syncLanguage = (nextLanguage?: string) => {
      const resolvedLanguage = resolveLocale(nextLanguage);

      setLanguage((currentLanguage) =>
        currentLanguage === resolvedLanguage
          ? currentLanguage
          : resolvedLanguage,
      );
      document.documentElement.lang = resolvedLanguage;
    };

    syncLanguage(i18n.resolvedLanguage ?? i18n.language);
    i18n.on("languageChanged", syncLanguage);

    return () => {
      i18n.off("languageChanged", syncLanguage);
    };
  }, [i18n]);

  const changeLanguage = useCallback(
    (nextLanguage: Locale) => {
      const currentLanguage = resolveLocale(
        i18n.resolvedLanguage ?? i18n.language,
      );

      if (currentLanguage === nextLanguage) {
        setLanguage((language) =>
          language === nextLanguage ? language : nextLanguage,
        );
        document.documentElement.lang = nextLanguage;
        return;
      }

      void i18n.changeLanguage(nextLanguage);
    },
    [i18n],
  );

  return {
    language,
    changeLanguage,
  };
}
