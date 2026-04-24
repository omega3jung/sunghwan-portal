import z from "zod";

export const assignmentRuleAssigneeSchema = z.object({
  jobFieldIds: z.array(z.string().min(1)),
  employeeIds: z.array(z.string().min(1)),
});

export const assigneeGroupSchema = assignmentRuleAssigneeSchema.refine(
    (value) => value.jobFieldIds.length > 0 || value.employeeIds.length > 0,
    {
      message:
        "Assignment rule requires at least one job field or employee assignee.",
    },
  );

export const assignmentRuleNodeSchema = z.object({
  id: z.string().optional(),
  categoryId: z.string().min(1).optional(),
  assignee: assigneeGroupSchema,
});

export const createAssignmentRuleSchema = assignmentRuleNodeSchema.extend({
  categoryId: z.string().min(1),
});

export const updateAssignmentRuleSchema = assignmentRuleNodeSchema.extend({
  categoryId: z.string().min(1),
});

export const saveAssignmentRuleTreeSchema = z.object({
  clientId: z.string().min(1),
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
