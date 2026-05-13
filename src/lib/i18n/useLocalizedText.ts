// src/lib/i18n/useLocalizedText.ts
"use client";

import { useTranslation } from "react-i18next";

import { Locale, LocalizedText } from "@/shared/types";
import { getLocalizedText } from "@/shared/utils/i18n";

export const useLocalizedText = () => {
  const { i18n } = useTranslation();

  return (text: LocalizedText | undefined) => {
    return getLocalizedText(text, i18n.language as Locale);
  };
};
