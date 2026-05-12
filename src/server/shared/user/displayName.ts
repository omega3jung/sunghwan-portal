import { LocalizedName } from "@/domain/organization";

export function toEnglishDisplayName(name: LocalizedName): string {
  const englishName = name.en;

  if (!englishName) {
    return "";
  }

  return [englishName.first, englishName.middle, englishName.last]
    .filter((part) => typeof part === "string" && part.trim().length > 0)
    .join(" ")
    .trim();
}
