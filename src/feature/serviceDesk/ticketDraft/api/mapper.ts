import type { Priority, RiskLevel } from "@/domain/common";
import type { TicketFormValues } from "@/feature/serviceDesk/ticket/forms";
import type { TicketDraftFormValues } from "@/feature/serviceDesk/ticketDraft/forms";
import type {
  TicketDraftAttachmentInputDto,
  TicketDraftWriteDto,
} from "@/server/data/serviceDesk/ticketDraft";

import type { TicketDraftResource } from "./types";

export type TicketDraftFormPayload = TicketDraftFormValues;
export type TicketDraftWriteFormPayload =
  | TicketDraftFormValues
  | TicketFormValues;

export function mapTicketDraftPayload(
  draft: TicketDraftResource | null,
): TicketDraftFormPayload | null {
  if (!draft) {
    return null;
  }

  return {
    id: draft.id,
    category: draft.categoryId ?? undefined,
    subject: draft.subject,
    body: draft.content,
    dueAt: new Date(draft.dueAt),
    priority: draft.priority,
    riskLevel: draft.riskLevel,
    email: draft.email,
    requester: {
      id: draft.requesterUsername,
      email: "",
      name: "",
    },
    attachment: [],
  };
}

export function toTicketDraftWritePayloadFromFormValues(
  form: TicketDraftWriteFormPayload,
): TicketDraftWriteDto {
  return {
    categoryId: form.category ?? null,
    approvalStepId: null,
    priority: normalizePriority(form.priority),
    riskLevel: normalizeRiskLevel(form.riskLevel),
    dueAt: form.dueAt.toISOString(),
    subject: form.subject,
    content: form.body,
    email: form.email,
    attachment: mapAttachments(form.attachment),
  };
}

function normalizePriority(value: string | null): Priority | null {
  if (!value) {
    return null;
  }

  const normalizedValue = value.toLowerCase();

  if (
    normalizedValue === "urgent" ||
    normalizedValue === "high" ||
    normalizedValue === "medium" ||
    normalizedValue === "low"
  ) {
    return normalizedValue;
  }

  return null;
}

function normalizeRiskLevel(value: string | null): RiskLevel | null {
  if (!value) {
    return null;
  }

  const normalizedValue = value.toLowerCase();

  if (
    normalizedValue === "critical" ||
    normalizedValue === "high" ||
    normalizedValue === "medium" ||
    normalizedValue === "low"
  ) {
    return normalizedValue;
  }

  return null;
}

function mapAttachments(files: File[]): TicketDraftAttachmentInputDto[] {
  return files.map((file) => ({
    name: file.name,
    type: file.type,
    size: file.size,
  }));
}
