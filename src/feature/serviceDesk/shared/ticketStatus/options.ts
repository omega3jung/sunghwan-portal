import type { TicketStatus } from "@/domain/serviceDesk";
import { ValueLabel } from "@/shared/types";

import { ticketStatusLocaleKey } from "./localeKeys";

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

export const getStatusOptions = (
  tStatus: (key: string) => string,
): ValueLabel<TicketStatus>[] => {
  return statusOptionValues.map((value) => {
    const localeKey = ticketStatusLocaleKey[value];

    return {
      value,
      label: tStatus(localeKey),
    };
  });
};
