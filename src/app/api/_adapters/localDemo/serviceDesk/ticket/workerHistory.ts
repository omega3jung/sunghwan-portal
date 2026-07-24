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

const WORK_ASSIGNMENT_EVENTS = new Set<DbTicketHistory["event"]>([
  "ASSIGNMENT_RESOLVED",
  "ASSIGNMENT_UPDATED",
]);

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
      isWorkAssignmentHistory(history) &&
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

function isWorkAssignmentHistory(history: DbTicketHistory) {
  if (
    history.type !== "ASSIGNMENT" ||
    !WORK_ASSIGNMENT_EVENTS.has(history.event)
  ) {
    return false;
  }

  const metadata = asRecord(history.metadata);

  return metadata?.assignmentPhase !== "APPROVAL";
}

function getHistoryAssigneeUsernames(history: DbTicketHistory) {
  return uniqueStrings([
    ...getAssigneeUsernames(history.from_value),
    ...getAssigneeUsernames(history.to_value),
    ...getAssigneeUsernames(history.metadata),
    ...getMetadataAssigneeUsernames(history.metadata),
  ]);
}

function getAssigneeUsernames(value: unknown) {
  return normalizeStringArray(asRecord(value)?.assigneeUsernames);
}

function getMetadataAssigneeUsernames(value: unknown) {
  const metadata = asRecord(value);

  if (!metadata) {
    return [];
  }

  return [
    ...normalizeStringArray(metadata.previousAssigneeUsernames),
    ...normalizeStringArray(metadata.nextAssigneeUsernames),
  ];
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

function uniqueStrings(items: string[]) {
  return Array.from(new Set(items));
}
