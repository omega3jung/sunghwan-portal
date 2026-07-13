import { Locale, ValueLabel } from "@/shared/types";

import { statusBadgeLocales, statusLocaleKey } from "./locales";
import { SystemStatus } from "./types";

const statusOptionValues = [
  "Draft",
  "Approval",
  "Declined",
  "Assigned",
  "Working",
  "Pending",
  "Rejected",
  "Resolved",
  "Closed",
] as const satisfies readonly SystemStatus[];

export const getStatusOptions = (
  locale: Locale = "en",
): ValueLabel<SystemStatus>[] => {
  const localizedLabels = statusBadgeLocales[locale];
  const fallbackLabels = statusBadgeLocales.en;

  return statusOptionValues.map((value) => {
    const localeKey = statusLocaleKey[value];

    return {
      value,
      label: localizedLabels[localeKey] ?? fallbackLabels[localeKey] ?? value,
    };
  });
};

export const statusOptions = getStatusOptions();
