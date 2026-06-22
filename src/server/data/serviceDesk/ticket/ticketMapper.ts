import { TicketDetailDto, TicketListItemDto } from "./ticketDto";
import { ServiceDeskTicketViewRow } from "./ticketRow";

export function toTicketListItemDto(
  row: ServiceDeskTicketViewRow,
  currentUserName: string | null,
): TicketListItemDto {
  return {
    ...toTicketCommonDto(row, currentUserName),
    age: calculateTicketAge(row.tk_created_at),
  };
}

export function toTicketDetailDto(
  row: ServiceDeskTicketViewRow,
  currentUserName: string | null,
): TicketDetailDto {
  return {
    ...toTicketCommonDto(row, currentUserName),
    content: row.tk_content,
    email: row.tk_email,
    files: row.tk_files ?? [],
    images: row.tk_images ?? [],
  };
}

function toTicketCommonDto(
  row: ServiceDeskTicketViewRow,
  currentUserName: string | null,
) {
  const assigneeUsernames = normalizePostgresStringArray(
    row.tk_assignee_usernames,
  );

  return {
    id: row.tk_id,
    ticket_number: row.tk_ticket_no,
    created_at: row.tk_created_at,
    updated_at: row.tk_updated_at,
    requester_username: row.tk_requester_username,
    status: row.tk_status,
    priority: row.tk_priority,
    risk_level: row.tk_risk_level,
    assignee_usernames: assigneeUsernames,
    work_minutes: row.tk_work_minutes,
    last_comment_at: row.tka_last_comment_at,
    last_commenter_email: row.tka_last_comment_email,
    last_user_activity_at: row.tka_last_user_activity_at,
    last_user_activity_email: row.tka_last_user_activity_email,
    close_reason: row.tk_close_reason,
    merged_into_ticket_id: row.tk_merged_into_ticket_id,
    merged_into_ticket_no: row.tk_merged_into_ticket_no,
    closed_at: row.tkh_closed_at,
    due_at: row.tk_due_at,
    owner:
      currentUserName !== null && currentUserName === row.tk_requester_username,
    assigned:
      currentUserName !== null && assigneeUsernames.includes(currentUserName),
    active: true,
    scope: row.cat_scope,
    category_id: String(row.cat_id),
    category_name: row.cat_name,
    category_parent_id:
      row.cat_parent_id === null ? null : String(row.cat_parent_id),
    approval_step_id:
      row.tk_approval_step_id === null ? null : String(row.tk_approval_step_id),
    subject: row.tk_subject,
  };
}

export function normalizePostgresStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter(
      (item): item is string => typeof item === "string" && item.length > 0,
    );
  }

  if (typeof value !== "string") {
    return [];
  }

  const normalized = value.trim();

  if (!normalized) {
    return [];
  }

  if (normalized.startsWith("[") && normalized.endsWith("]")) {
    try {
      const parsedValue = JSON.parse(normalized) as unknown;
      return normalizePostgresStringArray(parsedValue);
    } catch {
      return [];
    }
  }

  const arrayBody =
    normalized.startsWith("{") && normalized.endsWith("}")
      ? normalized.slice(1, -1)
      : normalized;

  return arrayBody
    .split(",")
    .map((item) => item.trim().replace(/^"|"$/g, ""))
    .filter(Boolean);
}

function calculateTicketAge(createdAt: string) {
  const createdTime = new Date(createdAt).getTime();
  const elapsedTime = Date.now() - createdTime;

  if (!Number.isFinite(elapsedTime) || elapsedTime <= 0) {
    return 0;
  }

  return Math.floor(elapsedTime / (1000 * 60 * 60 * 24));
}
