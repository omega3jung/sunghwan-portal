"use client";

import { useEffect, useState } from "react";

import type { Locale } from "@/shared/types";

export function useServiceDeskSettingsEditorLanguage(language: Locale) {
  const [editorLanguage, setEditorLanguage] = useState<Locale>(language);

  useEffect(() => {
    setEditorLanguage(language);
  }, [language]);

  return {
    editorLanguage,
    setEditorLanguage,
  };
}
