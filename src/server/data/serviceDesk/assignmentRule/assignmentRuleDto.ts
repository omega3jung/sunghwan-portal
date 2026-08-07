import type { ImageValueLabel, Locale } from "@/shared/types";

/** Defines the assignee group dto exchanged across the server API boundary. */
export interface AssigneeGroupDto {
  job_field_id: number[]; // string number. can use parseInt.
  employee_username: string[];
  include_tenant_company?: boolean;
}

type NonEmptyArray<T> = [T, ...T[]];

/** Defines the create assignment rule assignee dto exchanged across the server API boundary. */
export type CreateAssignmentRuleAssigneeDto =
  | (AssigneeGroupDto & {
      job_field_id: NonEmptyArray<number>;
    })
  | (AssigneeGroupDto & {
      employee_username: NonEmptyArray<string>;
    });

/** Defines the assignment rule dto exchanged across the server API boundary. */
export interface AssignmentRuleDto {
  assignment_rule_id: number;
  category_id: number; // string number. can use parseInt.
  assignee: AssigneeGroupDto;
}

/** Defines the create assignment rule input dto exchanged across the server API boundary. */
export interface CreateAssignmentRuleInputDto {
  tenant_id: number;
  category_id: number;
  assignee: CreateAssignmentRuleAssigneeDto;
}

/** Defines the update assignment rule input dto exchanged across the server API boundary. */
export interface UpdateAssignmentRuleInputDto {
  category_id: number;
  assignee: AssigneeGroupDto;
}

/** Reports whether assignment rule assignee selection meets the server-side condition. */
export function hasAssignmentRuleAssigneeSelection(
  assignee: AssigneeGroupDto,
): assignee is CreateAssignmentRuleAssigneeDto {
  return (
    assignee.job_field_id.length > 0 || assignee.employee_username.length > 0
  );
}

/** Defines the assignment recommendation source dto exchanged across the server API boundary. */
export type AssignmentRecommendationSourceDto =
  | "employee"
  | "jobField"
  | "mixed";

/** Defines the assignment recommendation input dto exchanged across the server API boundary. */
export interface AssignmentRecommendationInputDto {
  categoryId: string;
  assigneeUsernames: string[];
  language?: Locale;
}

/** Defines the assignment recommendation result dto exchanged across the server API boundary. */
export interface AssignmentRecommendationResultDto {
  recommendedUsers: ImageValueLabel[];
  source: AssignmentRecommendationSourceDto | null;
  selectedCategoryLabel: string;
}
