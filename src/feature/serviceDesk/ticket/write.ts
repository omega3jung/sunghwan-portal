import { z } from "zod";

import { Priority, RiskLevel } from "@/domain/common";

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

type TicketRequestAttachmentInput = {
  name?: string;
  type?: string;
  size?: number;
  url?: string;
};

const ticketEmailSchema = z.object({
  to: z.array(z.string()),
  cc: z.array(z.string()),
  bcc: z.array(z.string()),
});

const ticketRequesterSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
});

const ticketAttachmentSchema = z.object({
  name: z.string().optional(),
  type: z.string().optional(),
  size: z.number().optional(),
  url: z.string().optional(),
});

const ticketDueAtSchema = z.union([z.date(), z.string()]).refine((value) => {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isFinite(date.getTime());
});

const ticketWriteRequestSchema = z.object({
  category: z.string().optional(),
  subject: z.string(),
  body: z.string(),
  dueAt: ticketDueAtSchema,
  priority: z.string().nullable().optional(),
  riskLevel: z.string().nullable().optional(),
  email: ticketEmailSchema,
  requester: ticketRequesterSchema,
  attachment: z.array(ticketAttachmentSchema).default([]),
});

export const createTicketSchema = ticketWriteRequestSchema.refine(
  (value) => Boolean(value.category),
  {
    message: "Category is required.",
    path: ["category"],
  },
);

export const updateTicketSchema = ticketWriteRequestSchema.refine(
  (value) => Boolean(value.category),
  {
    message: "Category is required.",
    path: ["category"],
  },
);

export type TicketWriteRequestInput = z.infer<typeof ticketWriteRequestSchema>;

export type TicketWriteFields = {
  category?: string;
  subject: string;
  body: string;
  dueAt: DateInput;
  priority: string | null;
  riskLevel?: string | null;
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
  dueAt: string;
  priority: Priority | null;
  riskLevel?: RiskLevel | null;
  email: TicketEmailInput;
  requester: TicketRequesterInput;
  attachment: TicketAttachmentInput[];
};

export function toTicketWriteInput(
  input: TicketWriteRequestInput,
): CreateTicketInput;
export function toTicketWriteInput(
  input: TicketWriteRequestInput,
  ticketId: string,
): UpdateTicketInput;
export function toTicketWriteInput(
  input: TicketWriteRequestInput,
  ticketId?: string,
): CreateTicketInput | UpdateTicketInput {
  const normalizedAttachment = (
    input.attachment as TicketRequestAttachmentInput[]
  ).map((attachment) => ({
    name: attachment.name,
    type: attachment.type,
    size: attachment.size,
    url: attachment.url,
  }));

  const normalized = {
    category: input.category,
    subject: input.subject,
    body: input.body,
    dueAt: input.dueAt,
    priority: input.priority ?? null,
    riskLevel: input.riskLevel,
    email: input.email,
    requester: input.requester,
    attachment: normalizedAttachment,
  };

  if (ticketId) {
    return {
      ...normalized,
      id: ticketId,
    };
  }

  return normalized;
}

export function toTicketWritePayload(
  input: CreateTicketInput | UpdateTicketInput,
): DbTicketWriteInput {
  return {
    ...(input.id ? { id: input.id } : {}),
    category: input.category ?? null,
    subject: input.subject,
    body: input.body,
    dueAt: toIsoString(input.dueAt),
    priority: normalizePriority(input.priority),
    riskLevel: normalizeRiskLevel(input.riskLevel),
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

function normalizeRiskLevel(
  riskLevel: string | null | undefined,
): RiskLevel | null | undefined {
  if (riskLevel === undefined) {
    return undefined;
  }

  if (!riskLevel) {
    return null;
  }

  const normalized = riskLevel.toLowerCase();

  if (
    normalized === "critical" ||
    normalized === "high" ||
    normalized === "medium" ||
    normalized === "low"
  ) {
    return normalized;
  }

  return null;
}

function toIsoString(value: DateInput) {
  return value instanceof Date
    ? value.toISOString()
    : new Date(value).toISOString();
}
