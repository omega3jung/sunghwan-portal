import { TicketResolutionReason, TicketStatus } from "../types";

type MergeAwareTicket = {
  id: string;
  status: TicketStatus;
  closeReason?: TicketResolutionReason;
  mergedIntoTicketId?: string | null;
};

type AggregateOptions = {
  excludeMergedChildren?: boolean;
};

export function isMergedChildTicket(ticket: MergeAwareTicket): boolean {
  return (
    ticket.status === "Closed" &&
    ticket.closeReason === "Merged" &&
    Boolean(ticket.mergedIntoTicketId)
  );
}

export function shouldIncludeInTicketAggregates(
  ticket: MergeAwareTicket,
  options: AggregateOptions = {},
): boolean {
  if (options.excludeMergedChildren && isMergedChildTicket(ticket)) {
    return false;
  }

  return true;
}

export function canMergeTicketInto(
  source: MergeAwareTicket,
  target: MergeAwareTicket,
  getTicketById?: (ticketId: string) => MergeAwareTicket | undefined,
): boolean {
  if (source.status === "Draft" || target.status === "Draft") {
    return false;
  }

  if (source.id === target.id) {
    return false;
  }

  if (source.mergedIntoTicketId) {
    return false;
  }

  if (target.mergedIntoTicketId === source.id) {
    return false;
  }

  if (!getTicketById) {
    return true;
  }

  const seen = new Set<string>();
  let current: MergeAwareTicket | undefined = target;

  while (current?.mergedIntoTicketId) {
    const nextId = current.mergedIntoTicketId;

    if (nextId === source.id || seen.has(nextId)) {
      return false;
    }

    seen.add(nextId);
    current = getTicketById(nextId);
  }

  return true;
}
