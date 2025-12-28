import type { Locale } from "@/types";

export const preferencesMenuLocales: Record<Locale, Record<string, string>> = {
  en: {
    colorTheme: "Color theme",
    darkMode: "Dark Mode",
    language: "Language",
  },

  es: {
    colorTheme: "Tema de color",
    darkMode: "Modo oscuro",
    language: "Idioma",
  },

  fr: {
    colorTheme: "Thème de couleur",
    darkMode: "Mode sombre",
    language: "Langue",
  },

  ko: {
    colorTheme: "색상 테마",
    darkMode: "다크 모드",
    language: "언어",
  },
};
