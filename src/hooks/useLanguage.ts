import { useState } from "react";
import { useTranslation } from "react-i18next";

import { DEFAULT_LANGUAGE } from "@/domain/config";
import { Locale } from "@/shared/types";

export function useLanguageState() {
  const { i18n } = useTranslation();

  const [language, setLanguage] = useState<Locale>(DEFAULT_LANGUAGE);

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
