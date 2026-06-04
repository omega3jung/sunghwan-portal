import z from "zod";

import { ACCESS_LEVEL, type AccessLevel } from "@/domain/auth";

const accessLevelValues = Object.values(ACCESS_LEVEL) as AccessLevel[];

export const localizedTextSchema = z
  .object({
    en: z.string(),
  })
  .catchall(z.string());

export const approvalAssigneeSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("MANAGER"),
    level: z.union([z.literal(1), z.literal(2)]),
  }),
  z.object({
    type: z.literal("DEPARTMENT"),
    departmentId: z.string().min(1),
  }),
  z.object({
    type: z.literal("JOB_FIELD"),
    jobFieldId: z.string().min(1),
  }),
  z.object({
    type: z.literal("EMPLOYEE"),
    employeeUsernames: z.array(z.string().min(1)),
  }),
]);

export const skipAccessLevelSchema = z
  .number()
  .int()
  .refine(
    (value): value is AccessLevel =>
      accessLevelValues.includes(value as AccessLevel),
    {
      message: "Invalid access level.",
    },
  );

export const approvalStepSchema = z.object({
  id: z.string().optional(),
  name: localizedTextSchema,
  description: localizedTextSchema.optional(),
  index: z.number().int().nonnegative(),
  categoryId: z.string().min(1).optional(),
  stepAssignee: approvalAssigneeSchema,
  skipAccessLevel: skipAccessLevelSchema.optional(),
});

export const createApprovalStepSchema = approvalStepSchema.extend({
  categoryId: z.string().min(1),
});

export const updateApprovalStepSchema = approvalStepSchema.extend({
  categoryId: z.string().min(1),
});

export const saveApprovalStepTreeSchema = z.object({
  tenantId: z.string().min(1),
  categories: z.array(
    z.object({
      id: z.string().min(1),
      approvalSteps: z.array(approvalStepSchema.omit({ categoryId: true })),
    }),
  ),
});
