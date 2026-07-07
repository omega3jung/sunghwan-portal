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

    case "updatedAt":
      return compareDate(left.updatedAt ?? "", right.updatedAt ?? "");

    case "dueAt":
      return compareDate(left.dueAt, right.dueAt);

    case "priority":
      return comparePriority(left.priority, right.priority);

    case "status":
      return left.status.localeCompare(right.status);

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
  const leftTime = new Date(left).getTime();
  const rightTime = new Date(right).getTime();

  return (Number.isFinite(leftTime) ? leftTime : 0) -
    (Number.isFinite(rightTime) ? rightTime : 0);
}

function comparePriority(left: string, right: string): number {
  return (
    (priorityRank[left.toLowerCase()] ?? 0) -
    (priorityRank[right.toLowerCase()] ?? 0)
  );
}
