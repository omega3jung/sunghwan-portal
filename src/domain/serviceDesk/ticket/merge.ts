import { CategoryScope } from "../category";
import { TicketResolutionReason, TicketStatus } from "../types";

/** Close reasons that represent a ticket relation created by merge or escalation. */
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

/** Returns whether a closed ticket is a child of a merge or escalation relation. */
export function isMergedChildTicket(ticket: MergeAwareTicket): boolean {
  return (
    ticket.status === "Closed" &&
    (ticket.closeReason === "Merged" ||
      ticket.closeReason === "Escalated") &&
    Boolean(ticket.mergedIntoTicketId)
  );
}

/** Returns whether a closed ticket was escalated into a portal-scoped target. */
export function isEscalatedTicket(ticket: MergeAwareTicket): boolean {
  return (
    ticket.status === "Closed" &&
    ticket.closeReason === "Escalated" &&
    Boolean(ticket.mergedIntoTicketId)
  );
}

/** Resolves the allowed same-tenant relation from the source and target scopes. */
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

/** Applies the caller's policy for excluding merged child tickets from aggregates. */
export function shouldIncludeInTicketAggregates(
  ticket: MergeAwareTicket,
  options: AggregateOptions = {},
): boolean {
  if (options.excludeMergedChildren && isMergedChildTicket(ticket)) {
    return false;
  }

  return true;
}

/** Validates merge direction, status, identity, and optional relation-cycle safety. */
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
