import { useState } from "react";
import { useTranslation } from "react-i18next";

import { DEFAULT_LANGUAGE } from "@/domain/config";
import { Locale } from "@/shared/types";

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

  const [language, setLanguage] = useState<Locale>(DEFAULT_LANGUAGE);

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
  const changeLanguage = (language: Locale) => {
    i18n.changeLanguage(language);
    setLanguage(language);
    document.documentElement.lang = language;
  };

  return {
    language,
    changeLanguage,
  };
}
