import { Priority } from "@/domain/common";

export type DateInput = Date | string;

export type TicketEmailInput = {
  to: string[];
  cc: string[];
  bcc: string[];
};

export type TicketRequesterInput = {
  id: string;
  email: string;
  name: string;
};

export type TicketAttachmentInput = {
  name?: string;
  type?: string;
  size?: number;
  url?: string;
};

export type TicketWriteFields = {
  category?: string;
  subject: string;
  body: string;
  dueDate: DateInput;
  priority: string | null;
  email: TicketEmailInput;
  requester: TicketRequesterInput;
  attachment: TicketAttachmentInput[];
};

export type CreateTicketInput = TicketWriteFields & { id?: null };
export type UpdateTicketInput = TicketWriteFields & { id: string };

export type DbTicketWriteInput = {
  id?: string;
  category: string | null;
  subject: string;
  body: string;
  dueDate: string;
  priority: string | null;
  email: TicketEmailInput;
  requester: TicketRequesterInput;
  attachment: TicketAttachmentInput[];
};

export function toTicketWritePayload(
  input: CreateTicketInput | UpdateTicketInput,
): DbTicketWriteInput {
  return {
    ...(input.id ? { id: input.id } : {}),
    category: input.category ?? null,
    subject: input.subject,
    body: input.body,
    dueDate: toIsoString(input.dueDate),
    priority: normalizePriority(input.priority),
    email: input.email,
    requester: input.requester,
    attachment: input.attachment,
  };
}

function normalizePriority(priority: string | null): Priority | null {
  if (!priority) {
    return null;
  }

  const normalized = priority.toLowerCase();

  if (
    normalized === "urgent" ||
    normalized === "high" ||
    normalized === "medium" ||
    normalized === "low"
  ) {
    return normalized;
  }

  return null;
}

function toIsoString(value: DateInput) {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}
