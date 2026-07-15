"use client";

import { useCallback } from "react";

import { usePreferenceStore } from "@/lib/client/preference";
import { Localized, LocalizedText } from "@/shared/types";
import { Locale } from "@/shared/types";

export const useLocalizedValue = (language?: Locale) => {
  const systemLanguage = usePreferenceStore((state) => state.language);
  const resolvedLanguage = language ?? systemLanguage;

  return useCallback(
    <T>(value: Localized<T>): T => {
      return value[resolvedLanguage] ?? value.en;
    },
    [resolvedLanguage],
  );
};

export const useLocalizedText = (language?: Locale) => {
  const getValue = useLocalizedValue(language);

  return useCallback(
    (text: LocalizedText): string => {
      return getValue(text) ?? text.en;
    },
    [getValue],
  );
};
