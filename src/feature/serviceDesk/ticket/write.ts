import { z } from "zod";

import { Priority, RiskLevel } from "@/domain/common";
import { TicketAttachmentMetadata } from "@/domain/serviceDesk";
import type { PrepareTicketAttachmentsResponse } from "@/lib/application/contracts/serviceDesk";

import type { TicketFormValues } from "./forms";

/** Defines the date input accepted at this feature boundary. */
export type DateInput = Date | string;

/** Defines the ticket email input accepted at this feature boundary. */
export type TicketEmailInput = {
  to: string[];
  cc: string[];
  bcc: string[];
};

/** Defines the ticket requester input accepted at this feature boundary. */
export type TicketRequesterInput = {
  id: string;
  email: string;
  name: string;
};

/** Reuses the durable attachment metadata contract at the ticket-write boundary. */
export type TicketAttachmentMetadataDto = TicketAttachmentMetadata;

/** Defines the ticket attachment input accepted at this feature boundary. */
export type TicketAttachmentInput = TicketAttachmentMetadataDto;

type TicketRequestAttachmentInput = {
  originalName: string;
  replacedName: string;
  extension: string;
  size: number;
  type: string;
  demoUrl: string;
  replaced: true;
  reason: "SECURITY_DEMO_REPLACEMENT";
};

/** Defines the prepare ticket attachments input accepted at this feature boundary. */
export type PrepareTicketAttachmentsInput = {
  body: string;
  files: File[];
};

/** Defines the requester update ticket payload accepted at this feature boundary. */
export type RequesterUpdateTicketPayload = {
  categoryId: string;
  subject: string;
  content: string;
  dueAt: string;
  email: TicketEmailInput;
  files: TicketAttachmentMetadataDto[];
  images: TicketAttachmentMetadataDto[];
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
  originalName: z.string().trim().min(1),
  replacedName: z.string().trim().min(1),
  extension: z.string().trim().min(1),
  size: z.number().int().nonnegative(),
  type: z.string().trim().min(1),
  demoUrl: z.string().regex(/^\/files\/demo-[a-z0-9-]+\.[a-z0-9]+$/i),
  replaced: z.literal(true),
  reason: z.literal("SECURITY_DEMO_REPLACEMENT"),
});

const ticketDueAtSchema = z.union([z.date(), z.string()]).refine((value) => {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isFinite(date.getTime());
});

const ticketWriteRequestSchema = z.object({
  id: z.string().nullable().optional(),
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

/** Validates and normalizes ticket mutate request payload values before they leave the client feature boundary. */
export const ticketMutateRequestPayloadSchema = z.object({
  id: z.string().trim().min(1).nullable().optional(),
  tenantId: z.number().int().positive().nullable().optional(),
  categoryId: z.number().int().positive(),
  approvalStepId: z.number().int().positive().nullable().optional(),
  subject: z.string().trim().min(1).max(200),
  body: z.string().trim().min(1),
  dueAt: z.iso.datetime(),
  priority: z.enum(["urgent", "high", "medium", "low"]).nullable(),
  riskLevel: z
    .enum(["critical", "high", "medium", "low"])
    .nullable()
    .optional(),
  email: ticketEmailSchema,
  files: z.array(ticketAttachmentSchema).default([]),
  images: z.array(ticketAttachmentSchema).default([]),
});

/** Validates and normalizes create ticket values before they leave the client feature boundary. */
export const createTicketSchema = ticketWriteRequestSchema.refine(
  (value) => isRequiredNumberId(value.category),
  {
    message: "Category is required.",
    path: ["category"],
  },
);

/** Validates and normalizes update ticket values before they leave the client feature boundary. */
export const updateTicketSchema = ticketWriteRequestSchema.refine(
  (value) => isRequiredNumberId(value.category),
  {
    message: "Category is required.",
    path: ["category"],
  },
);

/** Defines the ticket write request input accepted at this feature boundary. */
export type TicketWriteRequestInput = z.infer<typeof ticketWriteRequestSchema>;

/** Collects the normalized fields shared by ticket create and update operations. */
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

/** Defines the create ticket input accepted at this feature boundary. */
export type CreateTicketInput = TicketWriteFields & { id?: null };
/** Defines the update ticket input accepted at this feature boundary. */
export type UpdateTicketInput = TicketWriteFields & { id: string };

/** Defines the db ticket write input accepted at this feature boundary. */
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

/** Defines the ticket mutate request payload accepted at this feature boundary. */
export type TicketMutateRequestPayload = {
  id?: string | null;
  tenantId?: number | null;
  categoryId: number;
  approvalStepId?: number | null;
  subject: string;
  body: string;
  dueAt: string;
  priority: Priority | null;
  riskLevel?: RiskLevel | null;
  email: TicketEmailInput;
  files: TicketAttachmentMetadataDto[];
  images: TicketAttachmentMetadataDto[];
};

/** Converts validated form fields to a new-ticket write input. */
export function toTicketWriteInput(
  input: TicketWriteRequestInput,
): CreateTicketInput;
/** Converts validated form fields plus an identity to an existing-ticket write input. */
export function toTicketWriteInput(
  input: TicketWriteRequestInput,
  ticketId: string,
): UpdateTicketInput;
/** Normalizes shared write fields and selects create or update shape from the optional ticket identity. */
export function toTicketWriteInput(
  input: TicketWriteRequestInput,
  ticketId?: string,
): CreateTicketInput | UpdateTicketInput {
  const normalizedAttachment = (
    input.attachment as TicketRequestAttachmentInput[]
  ).map((attachment) => ({
    originalName: attachment.originalName,
    replacedName: attachment.replacedName,
    extension: attachment.extension,
    size: attachment.size,
    type: attachment.type,
    demoUrl: attachment.demoUrl,
    replaced: true as const,
    reason: attachment.reason,
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

/** Maps a normalized ticket write input to the database-oriented compatibility payload. */
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

/** Maps normalized write fields to the HTTP mutation payload and separates file and image metadata. */
export function toTicketMutateRequestPayload(
  input: CreateTicketInput | UpdateTicketInput,
  prepared?: PrepareTicketAttachmentsResponse,
): TicketMutateRequestPayload {
  const files = prepared?.files ?? normalizeAttachmentMetadataList(input.attachment);
  const images = prepared?.images ?? [];

  return {
    ...(input.id ? { id: input.id } : {}),
    categoryId: normalizeRequiredNumberId(input.category),
    subject: input.subject,
    body: prepared?.body ?? input.body,
    dueAt: toIsoString(input.dueAt),
    priority: normalizePriority(input.priority),
    riskLevel: normalizeRiskLevel(input.riskLevel),
    email: input.email,
    files,
    images,
  };
}

/** Validates form values before producing the ticket mutation payload sent to the API. */
export function toTicketMutateRequestPayloadFromFormValues(
  input: TicketFormValues,
  prepared: PrepareTicketAttachmentsResponse,
): TicketMutateRequestPayload {
  return {
    ...(input.id ? { id: input.id } : {}),
    categoryId: normalizeRequiredNumberId(input.category),
    subject: input.subject,
    body: prepared.body,
    dueAt: toIsoString(input.dueAt),
    priority: normalizePriority(input.priority),
    riskLevel: normalizeRiskLevel(input.riskLevel),
    email: input.email,
    files: prepared.files,
    images: prepared.images,
  };
}

function normalizeAttachmentMetadataList(
  attachment: TicketAttachmentInput[],
): TicketAttachmentMetadataDto[] {
  return attachment.map((item) => ({
    originalName: item.originalName.trim(),
    replacedName: item.replacedName.trim(),
    extension: item.extension.trim().toLowerCase(),
    size: item.size,
    type: item.type.trim(),
    demoUrl: item.demoUrl.trim(),
    replaced: true,
    reason: "SECURITY_DEMO_REPLACEMENT",
  }));
}

function normalizeRequiredNumberId(value: string | null | undefined): number {
  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    throw new Error("Invalid ticket category id.");
  }

  return parsedValue;
}

function isRequiredNumberId(value: string | null | undefined): boolean {
  const parsedValue = Number(value);

  return Number.isInteger(parsedValue) && parsedValue > 0;
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
