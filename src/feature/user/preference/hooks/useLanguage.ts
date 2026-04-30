import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { DEFAULT_LANGUAGE } from "@/domain/config";
import { Locale } from "@/shared/types";
import { isLocale } from "@/shared/utils/i18n";

const resolveLocale = (value?: string): Locale => {
  return value && isLocale(value) ? value : DEFAULT_LANGUAGE;
};

/**
 * Manages the active i18n language in local React state and synchronizes it with the document language attribute.
 *
 * Use for:
 * - Changing the active locale from client components
 * - Keeping the document `lang` attribute aligned with the selected language
 *
 * @param none - This hook does not accept any arguments
 * @returns The current local language state and a function to change it
 */
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

  /**
   * Changes the active language in i18n state and updates the document language attribute.
   *
   * Use for:
   * - Applying a new locale selected by the user
   * - Keeping UI translations and document metadata in sync
   *
   * @param language - The locale code to apply to i18n and the root document
   * @returns Nothing; the function updates language-related client state in place
   */
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
