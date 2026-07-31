import type { TicketStatus } from "@/domain/serviceDesk";
import { Locale, ValueLabel } from "@/shared/types";

import { ticketStatusLocaleKey, ticketStatusLocales } from "./locales";

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
] as const satisfies readonly TicketStatus[];

/** Defines the supported get status choices presented by the feature. */
export const getStatusOptions = (
  locale: Locale = "en",
): ValueLabel<TicketStatus>[] => {
  const localizedLabels = ticketStatusLocales[locale];
  const fallbackLabels = ticketStatusLocales.en;

  return statusOptionValues.map((value) => {
    const localeKey = ticketStatusLocaleKey[value];

    return {
      value,
      label: localizedLabels[localeKey] ?? fallbackLabels[localeKey] ?? value,
    };
  });
};

/** Defines the supported status choices presented by the feature. */
export const statusOptions = getStatusOptions();
