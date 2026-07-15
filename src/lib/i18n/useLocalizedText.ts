// src/lib/i18n/useLocalizedText.ts
"use client";

import { useTranslation } from "react-i18next";

import { getLocalizedText } from "@/lib/application/i18n";
import { Locale, LocalizedText } from "@/shared/types";

export const useLocalizedText = () => {
  const { i18n } = useTranslation();

  return (text: LocalizedText | undefined) => {
    return getLocalizedText(text, i18n.language as Locale);
  };
};
