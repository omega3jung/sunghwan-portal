import { z } from "zod";

const ACTION_VALIDATION_KEY = {
  contentRequired: "actionTool.validation.contentRequired",
  contentMaxLength: "actionTool.validation.contentMaxLength",
  assigneeRequired: "actionTool.validation.assigneeRequired",
  targetTicketRequired: "actionTool.validation.targetTicketRequired",
} as const;

export const ticketActionTypeSchema = z.enum([
  "APPROVE",
  "DECLINE",
  "COMMENT",
  "NOTE",
  "ASSIGN",
  "ASSIGN_SELF",
  "REJECT",
  "MERGE",
  "ADJUST",
  "REOPEN",
  "RESUBMIT",
  "CANCEL",
]);

const actionContentSchema = z
  .string()
  .trim()
  .min(1, ACTION_VALIDATION_KEY.contentRequired)
  .max(2000, ACTION_VALIDATION_KEY.contentMaxLength);

const actionAttachmentSchema = z.object({
  id: z.string(),
  name: z.string(),
  size: z.number(),
  url: z.string().optional(),
});

export const ticketActionDraftFormSchema = z
  .object({
    actionType: ticketActionTypeSchema,
    content: actionContentSchema,
    attachment: z.file().array(),
    assigneeUsernames: z.string().array(),
    categoryId: z.string(),
    targetTicketId: z.string(),
    priority: z.string(),
    riskLevel: z.string(),
    dueAt: z.date().optional(),
  })
  .superRefine((values, context) => {
    if (values.actionType === "ASSIGN" && values.assigneeUsernames.length < 1) {
      context.addIssue({
        code: "custom",
        path: ["assigneeUsernames"],
        message: ACTION_VALIDATION_KEY.assigneeRequired,
      });
    }

    if (
      values.actionType === "MERGE" &&
      values.targetTicketId.trim().length === 0
    ) {
      context.addIssue({
        code: "custom",
        path: ["targetTicketId"],
        message: ACTION_VALIDATION_KEY.targetTicketRequired,
      });
    }
  });

export const ticketActionPayloadSchema = z.object({
  id: z.string(),
  actionType: ticketActionTypeSchema,
  content: actionContentSchema,
  files: z.array(actionAttachmentSchema),
  images: z.array(actionAttachmentSchema),
  assigneeUsernames: z.string().array().optional(),
  categoryId: z.string().optional(),
  targetTicketId: z.string().optional(),
  priority: z.string().optional(),
  riskLevel: z.string().optional(),
  dueAt: z.string().optional(),
});

export const ticketActionFormSchema = ticketActionPayloadSchema;
