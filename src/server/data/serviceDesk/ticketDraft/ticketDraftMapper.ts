import { Priority, RiskLevel } from "@/domain/common";
import { Attach } from "@/domain/serviceDesk";
import { normalizePostgresStringArray } from "@/server/data/serviceDesk/shared";

import { ServiceDeskTicketEmail } from "../ticket/ticketRow";
import {
  TicketDraftAttachmentInputDto,
  TicketDraftDto,
  TicketDraftWriteDto,
} from "./ticketDraftDto";
import { ServiceDeskTicketDraftRow, TicketDraftRowInput } from "./ticketDraftRow";

const DEFAULT_PRIORITY: Priority = "medium";
const DEFAULT_RISK_LEVEL: RiskLevel = "medium";

const EMPTY_EMAIL: ServiceDeskTicketEmail = {
  to: [],
  cc: [],
  bcc: [],
};

export function mapTicketDraftRowToDto(
  row: ServiceDeskTicketDraftRow,
): TicketDraftDto {
  return {
    id: row.tk_id,
    ticketNo: row.tk_ticket_no,
    createdAt: row.tk_created_at,
    updatedAt: row.tk_updated_at ?? row.tk_created_at,
    requesterUsername: row.tk_requester_username,
    status: "Draft",
    active: row.tk_active,
    categoryId: row.tk_category_id === null ? null : String(row.tk_category_id),
    approvalStepId:
      row.tk_approval_step_id === null
        ? null
        : String(row.tk_approval_step_id),
    priority: row.tk_priority ?? DEFAULT_PRIORITY,
    riskLevel: row.tk_risk_level ?? DEFAULT_RISK_LEVEL,
    assigneeUsernames: normalizePostgresStringArray(row.tk_assignee_usernames),
    dueAt: row.tk_due_at ?? row.tk_created_at,
    subject: row.tk_subject ?? "",
    content: row.tk_content ?? "",
    email: normalizeEmail(row.tk_email),
    files: normalizeAttachments(row.tk_files),
    images: normalizeAttachments(row.tk_images),
  };
}

export function mapTicketDraftWriteDtoToRowInput(
  input: TicketDraftWriteDto,
): TicketDraftRowInput {
  const attachments = splitAttachments(input.attachment);

  return {
    tk_category_id: normalizeNumberId(input.categoryId),
    tk_approval_step_id: normalizeNumberId(input.approvalStepId),
    tk_priority: input.priority ?? DEFAULT_PRIORITY,
    tk_risk_level: input.riskLevel ?? DEFAULT_RISK_LEVEL,
    tk_assignee_usernames: [],
    tk_due_at: input.dueAt,
    tk_subject: input.subject,
    tk_content: input.content,
    tk_email: normalizeEmail(input.email),
    tk_files: attachments.files,
    tk_images: attachments.images,
  };
}

function normalizeNumberId(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) ? parsedValue : null;
}

function normalizeEmail(value: unknown): ServiceDeskTicketEmail {
  if (!value || typeof value !== "object") {
    return EMPTY_EMAIL;
  }

  const record = value as Partial<ServiceDeskTicketEmail>;

  return {
    to: normalizeStringArray(record.to),
    cc: normalizeStringArray(record.cc),
    bcc: normalizeStringArray(record.bcc),
  };
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (item): item is string => typeof item === "string" && item.length > 0,
  );
}

function normalizeAttachments(value: unknown): Attach[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(isAttach);
}

function isAttach(value: unknown): value is Attach {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Partial<Attach>;

  return (
    typeof record.index === "number" &&
    (record.type === "file" || record.type === "image") &&
    typeof record.name === "string" &&
    typeof record.url === "string" &&
    typeof record.active === "boolean"
  );
}

function splitAttachments(attachment: TicketDraftAttachmentInputDto[]) {
  const files: Attach[] = [];
  const images: Attach[] = [];

  attachment.forEach((item, index) => {
    const type = (item.type ?? "").toLowerCase().startsWith("image/")
      ? "image"
      : "file";
    const target = type === "image" ? images : files;

    target.push({
      index: target.length,
      type,
      name: item.name?.trim() || `attachment-${index + 1}`,
      url: item.url ?? "",
      active: true,
    });
  });

  return { files, images };
}
