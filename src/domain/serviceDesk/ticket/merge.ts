import { CategoryScope } from "../category";
import { TicketResolutionReason, TicketStatus } from "../types";

/** Close reasons that create a persisted merge or escalation relation. */
export type TicketMergeCloseReason = Extract<
  TicketResolutionReason,
  "Merged" | "Escalated"
>;

type MergeAwareTicket = {
  id: string;
  tenantId: string | null;
  scope: CategoryScope;
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
    (ticket.closeReason === "Merged" ||
      ticket.closeReason === "Escalated") &&
    Boolean(ticket.mergedIntoTicketId)
  );
}

export function isEscalatedTicket(ticket: MergeAwareTicket): boolean {
  return (
    ticket.status === "Closed" &&
    ticket.closeReason === "Escalated" &&
    Boolean(ticket.mergedIntoTicketId)
  );
}

/** Only same-tenant scope combinations map to an allowed merge relation. */
export function resolveTicketMergeCloseReason(
  source: Pick<MergeAwareTicket, "tenantId" | "scope">,
  target: Pick<MergeAwareTicket, "tenantId" | "scope">,
): TicketMergeCloseReason | null {
  if (
    source.tenantId === null ||
    target.tenantId === null ||
    source.tenantId !== target.tenantId
  ) {
    return null;
  }

  if (source.scope === target.scope) {
    return "Merged";
  }

  if (source.scope === "INTERNAL" && target.scope === "PORTAL") {
    return "Escalated";
  }

  return null;
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

/** The optional lookup extends validation to relation cycles beyond the direct target. */
export function canMergeTicketInto(
  source: MergeAwareTicket,
  target: MergeAwareTicket,
  getTicketById?: (ticketId: string) => MergeAwareTicket | undefined,
): boolean {
  if (!resolveTicketMergeCloseReason(source, target)) {
    return false;
  }

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
