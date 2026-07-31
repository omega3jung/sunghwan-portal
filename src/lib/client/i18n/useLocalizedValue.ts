"use client";

import { useCallback } from "react";

import { usePreferenceStore } from "@/lib/client/preference";
import { Localized, LocalizedText } from "@/shared/types";
import { Locale } from "@/shared/types";

/** Returns a memoized selector using the requested or persisted locale and English fallback. */
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

/** Returns a memoized localized-text selector backed by `useLocalizedValue`. */
export const useLocalizedText = (language?: Locale) => {
  const getValue = useLocalizedValue(language);

  return useCallback(
    (text: LocalizedText): string => {
      return getValue(text) ?? text.en;
    },
    [getValue],
  );
};
