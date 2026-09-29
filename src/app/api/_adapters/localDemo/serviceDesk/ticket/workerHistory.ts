import type { TicketDetail } from "@/domain/serviceDesk";
import type { DbTicketHistory } from "@/lib/application/contracts/serviceDesk";

import { getLocalDemoHistories } from "./state";

type LocalTicketWorkerHistoryProjection = Pick<
  TicketDetail,
  "id" | "assignmentPhase" | "workAssigneeUsernames" | "hasBeenWorker"
>;

type LocalTicketWorkerHistoryOptions = {
  isInternal: boolean;
  currentUserName: string | null;
};

/** Projects local ticket worker history for the server-side LOCAL ticket adapter. */
export function withLocalTicketWorkerHistory<
  T extends LocalTicketWorkerHistoryProjection,
>(
  ticket: T,
  options: LocalTicketWorkerHistoryOptions,
): T {
  const username = normalizeUsername(options.currentUserName);
  const hasBeenWorker =
    username !== null &&
    (ticket.hasBeenWorker ||
      isCurrentWorkAssignee(ticket, username) ||
      hasLocalTicketWorkAssignmentHistory({
        isInternal: options.isInternal,
        ticketId: ticket.id,
        username,
      }));

  return {
    ...ticket,
    hasBeenWorker,
  };
}

/** Returns whether local ticket work assignment history under the server-side LOCAL ticket adapter policy. */
export function hasLocalTicketWorkAssignmentHistory({
  isInternal: _isInternal,
  ticketId,
  username,
}: {
  isInternal: boolean;
  ticketId: string;
  username: string;
}): boolean {
  const normalizedUsername = normalizeUsername(username);

  if (normalizedUsername === null) {
    return false;
  }

  return getLocalDemoHistories().some(
    (history) =>
      history.ticket_id === ticketId &&
      getHistoryAssigneeUsernames(history).includes(normalizedUsername),
  );
}

function isCurrentWorkAssignee(
  ticket: Pick<
    TicketDetail,
    "assignmentPhase" | "workAssigneeUsernames"
  >,
  username: string,
) {
  return (
    ticket.assignmentPhase === "WORK" &&
    ticket.workAssigneeUsernames.includes(username)
  );
}

function getHistoryAssigneeUsernames(history: DbTicketHistory): string[] {
  if (history.type === "ASSIGNMENT") {
    if (history.event === "ASSIGNMENT_RESOLVED") {
      // The old assignees can be approvers; only the resolved workers count.
      return getAssigneeUsernames(history.to_value);
    }
    const metadata = asRecord(history.metadata);
    if (history.event === "ASSIGNMENT_UPDATED" &&
      (metadata?.assignmentPhase === "WORK" || metadata?.actionType === "ASSIGN_SELF")) {
      return [...getAssigneeUsernames(history.from_value), ...getAssigneeUsernames(history.to_value)];
    }
  }
  if (history.type !== "TICKET" || history.event !== "ROUTING_RESET") return [];
  // Requester updates store routing in metadata; forced settings resets use
  // from/to snapshots. Explicit JSON null is WORK; an absent key is unknown.
  const metadata = asRecord(history.metadata);
  const from = asRecord(history.from_value);
  const to = asRecord(history.to_value);
  return [
    ...(metadata?.previousApprovalStepId === null ? normalizeStringArray(metadata.previousAssigneeUsernames) : []),
    ...(metadata?.nextApprovalStepId === null ? normalizeStringArray(metadata.nextAssigneeUsernames) : []),
    ...(from?.approvalStepId === null ? getAssigneeUsernames(from) : []),
    ...(to?.approvalStepId === null ? getAssigneeUsernames(to) : []),
  ];
}

function getAssigneeUsernames(value: unknown) {
  return normalizeStringArray(asRecord(value)?.assigneeUsernames);
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function normalizeStringArray(value: unknown) {
  return Array.isArray(value)
    ? value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];
}

function normalizeUsername(value: string | null) {
  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.trim();
  return normalizedValue.length > 0 ? normalizedValue : null;
}
