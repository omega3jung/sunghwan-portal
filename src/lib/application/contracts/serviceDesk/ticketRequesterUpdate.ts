import { z } from "zod";

import type { TicketAttachmentMetadata } from "@/domain/serviceDesk";

const ticketEmailSchema = z
  .object({
    to: z.array(z.string()).default([]),
    cc: z.array(z.string()).default([]),
    bcc: z.array(z.string()).default([]),
  })
  .default({ to: [], cc: [], bcc: [] });

const ticketAttachmentMetadataSchema = z.object({
  originalName: z.string().trim().min(1).max(200),
  replacedName: z.string().trim().min(1),
  extension: z.string().trim().min(1),
  size: z.number().int().nonnegative(),
  type: z.string().trim().min(1),
  demoUrl: z.string().regex(/^\/files\/demo-[a-z0-9-]+\.[a-z0-9]+$/i),
  replaced: z.literal(true),
  reason: z.literal("SECURITY_DEMO_REPLACEMENT"),
});

const requesterUpdateCategoryIdSchema = z
  .union([z.string(), z.number().int().positive()])
  .transform((value) => String(value).trim())
  .refine((value) => /^[1-9]\d*$/.test(value), {
    message: "Invalid category id.",
  });

export const requesterUpdateTicketRequestSchema = z
  .object({
    categoryId: requesterUpdateCategoryIdSchema,
    subject: z.string().trim().min(1).max(200),
    content: z.string().trim().min(1),
    dueAt: z.iso.datetime(),
    email: ticketEmailSchema,
    files: z.array(ticketAttachmentMetadataSchema).default([]),
    images: z.array(ticketAttachmentMetadataSchema).default([]),
  })
  .strict();

export type RequesterUpdateTicketRequestDto = z.infer<
  typeof requesterUpdateTicketRequestSchema
>;

export type RequesterUpdateTicketAttachmentDto = TicketAttachmentMetadata;
