import type { TicketStatus } from "@/domain/serviceDesk";

export const OPEN_TICKET_STATUS_FILTER_VALUE = "Open";

export type TicketStatusFilterValue =
  | TicketStatus
  | typeof OPEN_TICKET_STATUS_FILTER_VALUE;

export const OPEN_TICKET_STATUS_FILTER_VALUES = [
  "Approval",
  "Declined",
  "Assigned",
  "Working",
  "Pending",
  "Rejected",
] as const satisfies readonly TicketStatus[];

export const TICKET_STATUS_FILTER_VALUES = [
  OPEN_TICKET_STATUS_FILTER_VALUE,
  ...OPEN_TICKET_STATUS_FILTER_VALUES,
  "Resolved",
  "Closed",
] as const satisfies readonly TicketStatusFilterValue[];

const ticketStatusSet = new Set<string>(
  TICKET_STATUS_FILTER_VALUES.filter(
    (value) => value !== OPEN_TICKET_STATUS_FILTER_VALUE,
  ),
);

export const normalizeTicketStatusFilterValues = (
  values: readonly string[],
): TicketStatusFilterValue[] => {
  const normalized = values.flatMap<TicketStatusFilterValue>((value) => {
    if (value === OPEN_TICKET_STATUS_FILTER_VALUE) {
      return value;
    }

    if (value === "Approved") {
      return "Assigned";
    }

    if (value === "Reopen") {
      return "Working";
    }

    return ticketStatusSet.has(value) ? (value as TicketStatus) : [];
  });

  return Array.from(new Set(normalized));
};

export const expandTicketStatusFilters = (
  values: readonly string[],
): TicketStatus[] => {
  const expanded = normalizeTicketStatusFilterValues(values).flatMap(
    (value) => {
      if (value === OPEN_TICKET_STATUS_FILTER_VALUE) {
        return OPEN_TICKET_STATUS_FILTER_VALUES;
      }

      return value;
    },
  );

  return Array.from(new Set(expanded));
};
