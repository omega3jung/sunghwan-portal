import { z } from "zod";

import { TicketAttachmentMetadata } from "@/domain/serviceDesk";

import { ticketAttachmentMetadataSchema, ticketEmailSchema } from "./ticketDto";

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
