import { TicketDetail } from "@/domain/serviceDesk";
import { TicketSortField } from "@/feature/serviceDesk/ticket/api/types";
import { SortDirection } from "@/shared/types";

const priorityRank: Record<string, number> = {
  low: 1,
  medium: 2,
  high: 3,
  urgent: 4,
};

export function sortTickets(
  tickets: TicketDetail[],
  sort?: {
    field: TicketSortField;
    direction: SortDirection;
  },
): TicketDetail[] {
  if (!sort) {
    return tickets;
  }

  return [...tickets].sort((left, right) => {
    const result = compareTicket(left, right, sort.field);

    return sort.direction === "asc" ? result : -result;
  });
}

function compareTicket(
  left: TicketDetail,
  right: TicketDetail,
  field: TicketSortField,
): number {
  switch (field) {
    case "ticketNumber":
      return compareTicketNumber(left.ticketNumber, right.ticketNumber);

    case "createdAt":
      return compareDate(left.createdAt, right.createdAt);

    case "dueAt":
      return compareDate(left.dueAt, right.dueAt);

    case "priority":
      return comparePriority(left.priority, right.priority);

    default:
      return 0;
  }
}

function compareTicketNumber(left: string, right: string): number {
  return getTicketNumber(left) - getTicketNumber(right);
}

function getTicketNumber(ticketNumber: string): number {
  const matched = ticketNumber.match(/\d+$/);

  return matched ? Number(matched[0]) : 0;
}

function compareDate(left: string, right: string): number {
  return new Date(left).getTime() - new Date(right).getTime();
}

function comparePriority(left: string, right: string): number {
  return (
    (priorityRank[left.toLowerCase()] ?? 0) -
    (priorityRank[right.toLowerCase()] ?? 0)
  );
}
