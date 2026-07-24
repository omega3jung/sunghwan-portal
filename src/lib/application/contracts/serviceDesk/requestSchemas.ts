import z from "zod";

import { ACCESS_LEVEL, type AccessLevel } from "@/domain/auth";
import type { LocalizedText } from "@/shared/types";

const localizedTextSchema = z.object({ en: z.string() }).catchall(z.string());
const optionalLocalizedTextSchema = z
  .object({})
  .catchall(z.string())
  .transform<LocalizedText>((value) => {
    if (typeof value.en === "string") return value as LocalizedText;

    const fallback =
      Object.values(value).find((entry) => entry.trim().length > 0) ?? "";
    return { en: fallback, ...value };
  });

const tenantSchema = z.object({
  id: z.string().optional(),
  companyId: z.string().min(1),
  name: localizedTextSchema,
  color: z.string().optional(),
  active: z.boolean().optional(),
});

export const createTenantSchema = tenantSchema.omit({ id: true });
export const updateTenantSchema = tenantSchema.omit({ id: true });

const subCategorySchema = z.object({
  id: z.string().optional(),
  name: localizedTextSchema,
  description: optionalLocalizedTextSchema.optional(),
  requestTemplate: optionalLocalizedTextSchema.optional(),
  index: z.number().int().nonnegative(),
  active: z.boolean(),
  defaultPriority: z.enum(["urgent", "high", "medium", "low"]).optional(),
  defaultRiskLevel: z.enum(["critical", "high", "medium", "low"]).optional(),
  defaultSlaDays: z.number().int().nonnegative().optional(),
});
const categorySchema = z.object({
  id: z.string().optional(),
  tenantId: z.string().min(1).optional(),
  name: localizedTextSchema,
  description: optionalLocalizedTextSchema.optional(),
  requestTemplate: optionalLocalizedTextSchema.optional(),
  scope: z.enum(["PORTAL", "INTERNAL"]),
  index: z.number().int().nonnegative(),
  active: z.boolean(),
  defaultPriority: z.enum(["urgent", "high", "medium", "low"]),
  defaultRiskLevel: z.enum(["critical", "high", "medium", "low"]),
  defaultSlaDays: z.number().int().nonnegative(),
  subCategories: z.array(subCategorySchema),
});

export const saveCategoryTreeSchema = z.object({
  tenantId: z.string().min(1),
  categories: z.array(categorySchema.omit({ tenantId: true })),
});

const accessLevelValues = Object.values(ACCESS_LEVEL) as AccessLevel[];
const approvalAssigneeSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("MANAGER"),
    level: z.union([z.literal(1), z.literal(2)]),
  }),
  z.object({ type: z.literal("DEPARTMENT"), departmentId: z.string().min(1) }),
  z.object({ type: z.literal("JOB_FIELD"), jobFieldId: z.string().min(1) }),
  z.object({
    type: z.literal("EMPLOYEE"),
    employeeUsernames: z.array(z.string().min(1)),
  }),
]);
const skipAccessLevelSchema = z
  .number()
  .int()
  .refine(
    (value): value is AccessLevel =>
      accessLevelValues.includes(value as AccessLevel),
    { message: "Invalid access level." },
  );
const approvalStepSchema = z.object({
  id: z.string().optional(),
  name: localizedTextSchema,
  description: localizedTextSchema.optional(),
  index: z.number().int().nonnegative(),
  categoryId: z.string().min(1).optional(),
  stepAssignee: approvalAssigneeSchema,
  skipAccessLevel: skipAccessLevelSchema.optional(),
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

const assignmentRuleAssigneeSchema = z.object({
  jobFieldIds: z.array(z.string().min(1)),
  assigneeUsernames: z.array(z.string().min(1)),
  includeTenantCompany: z.boolean().optional().default(false),
});
const assigneeGroupSchema = assignmentRuleAssigneeSchema.refine(
  (value) => value.jobFieldIds.length > 0 || value.assigneeUsernames.length > 0,
  {
    message:
      "Assignment rule requires at least one job field or employee assignee.",
  },
);

export const saveAssignmentRuleTreeSchema = z.object({
  tenantId: z.string().min(1),
  categories: z.array(
    z.object({
      id: z.string().min(1),
      assignee: assigneeGroupSchema,
      subCategories: z.array(
        z.object({
          id: z.string().min(1),
          assignee: assignmentRuleAssigneeSchema,
        }),
      ),
    }),
  ),
});
