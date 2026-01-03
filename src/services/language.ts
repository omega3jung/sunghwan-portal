import { useState } from "react";
import { useTranslation } from "react-i18next";

export function useLanguageState() {
  const { i18n } = useTranslation();

  const [language, setLanguage] = useState<string>("en");

  const changeLanguage = (language: string) => {
    i18n.changeLanguage(language);
    setLanguage(language);
    document.documentElement.lang = language;
  };

  return {
    language,
    changeLanguage,
  };
}
