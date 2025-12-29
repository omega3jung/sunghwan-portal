import type { Locale } from "@/types";

export const preferencesMenuLocales: Record<Locale, Record<string, string>> = {
  en: {
    colorTheme: "Color theme",
    theme: "Mode",
    light: "Light",
    dark: "Dark",
    system: "System",
    language: "Language",
  },

  es: {
    colorTheme: "Tema de color",
    theme: "Modo",
    light: "Claro",
    dark: "Oscuro",
    system: "Sistema",
    language: "Idioma",
  },

  fr: {
    colorTheme: "Thème de couleur",
    theme: "Mode",
    light: "Clair",
    dark: "Sombre",
    system: "Système",
    language: "Langue",
  },

  ko: {
    colorTheme: "색상 테마",
    theme: "모드",
    light: "라이트",
    dark: "다크",
    system: "시스템",
    language: "언어",
  },
};
