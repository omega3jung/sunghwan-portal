import type {
  TicketHistoryEvent,
  TicketHistoryJsonValue,
  TicketHistorySource,
} from "./ticketHistoryTypes";

export function compactJsonObject(
  value: Record<string, TicketHistoryJsonValue | undefined>,
): TicketHistoryJsonValue | null {
  const entries = Object.entries(value).filter(
    (entry): entry is [string, TicketHistoryJsonValue] =>
      entry[1] !== undefined,
  );

  return entries.length > 0 ? Object.fromEntries(entries) : null;
}

export function normalizeMetadataRecord(
  value: TicketHistoryJsonValue | null | undefined,
): Record<string, TicketHistoryJsonValue> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

export function getMetadataSource(
  value: Record<string, TicketHistoryJsonValue>,
): TicketHistorySource | undefined {
  return isTicketHistorySource(value.source) ? value.source : undefined;
}

export function getMetadataEvent(
  value: Record<string, TicketHistoryJsonValue>,
): TicketHistoryEvent | undefined {
  return isTicketHistoryEvent(value.event) ? value.event : undefined;
}

export function omitMetadataIdentity(
  value: Record<string, TicketHistoryJsonValue>,
): Record<string, TicketHistoryJsonValue> {
  const { event: _event, source: _source, ...metadata } = value;
  return metadata;
}

export function omitMetadataIdentityFromJsonValue(
  value: TicketHistoryJsonValue | null | undefined,
): TicketHistoryJsonValue | null | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return value;
  }

  return omitMetadataIdentity(value);
}

function isTicketHistorySource(value: unknown): value is TicketHistorySource {
  return (
    value === "USER_ACTION" ||
    value === "SYSTEM_AUTO" ||
    value === "ROUTING_RULE" ||
    value === "APPROVAL_RULE" ||
    value === "ASSIGNMENT_RULE"
  );
}

function isTicketHistoryEvent(value: unknown): value is TicketHistoryEvent {
  return (
    value === "TICKET_SUBMITTED" ||
    value === "TICKET_UPDATED" ||
    value === "TICKET_REOPENED" ||
    value === "TICKET_REJECTED" ||
    value === "TICKET_MERGED" ||
    value === "TICKET_CANCELED" ||
    value === "CATEGORY_UPDATED" ||
    value === "STATUS_UPDATED" ||
    value === "RESOLUTION_CLOSE" ||
    value === "APPROVAL_REQUESTED" ||
    value === "APPROVAL_APPROVED" ||
    value === "APPROVAL_DECLINED" ||
    value === "ASSIGNMENT_RESOLVED" ||
    value === "ASSIGNMENT_UPDATED" ||
    value === "COMMENT_CREATED" ||
    value === "COMMENT_UPDATED" ||
    value === "COMMENT_DELETED" ||
    value === "NOTE_CREATED" ||
    value === "NOTE_UPDATED" ||
    value === "NOTE_DELETED" ||
    value === "PLANNING_UPDATED" ||
    value === "WORK_SESSION_STARTED" ||
    value === "WORK_SESSION_STOPPED" ||
    value === "WORK_SESSION_UPDATED" ||
    value === "WORK_SESSION_DELETED" ||
    value === "ROUTING_RESET" ||
    value === "ROUTING_PRESERVED"
  );
}
