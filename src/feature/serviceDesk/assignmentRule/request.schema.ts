import z from "zod";

const assignmentRuleAssigneeSchema = z.object({
  jobFieldIds: z.array(z.string().min(1)),
  assigneeUsernames: z.array(z.string().min(1)),
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
