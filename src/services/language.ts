import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Locale } from "@/domain/config";

export function useLanguageState() {
  const { i18n } = useTranslation();

  const [language, setLanguage] = useState<Locale>("en");

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
