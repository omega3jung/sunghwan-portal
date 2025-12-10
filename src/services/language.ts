import { AvailableLanguages } from "@/types";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export function useLanguageState() {
  const { i18n } = useTranslation();

  const [state, setState] = useState(() =>
    sessionStorage.getItem("NEXT_LOCALE")
  );

  const setLanguage = (language: string) => {
    i18n.changeLanguage(language);
    sessionStorage.setItem("NEXT_LOCALE", language);
    setState(language);
  };

  return {
    language: state,
    setLanguage,
  };
}
