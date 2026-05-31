import { DisplayName, LocalizedName } from "@/domain/organization";
import { LocalizedText } from "@/shared/types";

export const displayNameMapper = (name: LocalizedName): LocalizedText => {
  const result: LocalizedText = {
    en: formatDisplayName(name.en),
  };

  for (const localeName in name) {
    const locale = localeName as keyof LocalizedName;

    if (locale === "en") {
      continue;
    }

    const displayName = name[locale];

    if (!displayName) {
      continue;
    }

    result[locale] = formatDisplayName(displayName);
  }

  return result;
};

const formatDisplayName = (name: DisplayName): string => {
  return [name.first, name.middle, name.last].filter(Boolean).join(" ");
};
