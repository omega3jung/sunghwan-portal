import { Locale } from "@/domain/config";
import { ValueLabel } from "@/shared/types/options";

export const languageOptions: ValueLabel<Locale>[] = [
  { label: "English", value: "en" },
  { label: "한국어", value: "ko" },
  { label: "Français", value: "fr" },
  { label: "Español", value: "es" },
];
