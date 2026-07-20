import type { ImageValueLabel, Locale } from "@/shared/types";

export interface AssigneeGroupDto {
  job_field_id: number[]; // string number. can use parseInt.
  employee_username: string[];
  include_tenant_company?: boolean;
}

type NonEmptyArray<T> = [T, ...T[]];

export type CreateAssignmentRuleAssigneeDto =
  | (AssigneeGroupDto & {
      job_field_id: NonEmptyArray<number>;
    })
  | (AssigneeGroupDto & {
      employee_username: NonEmptyArray<string>;
    });

export interface AssignmentRuleDto {
  assignment_rule_id: number;
  category_id: number; // string number. can use parseInt.
  assignee: AssigneeGroupDto;
}

export interface CreateAssignmentRuleInputDto {
  tenant_id: number;
  category_id: number;
  assignee: CreateAssignmentRuleAssigneeDto;
}

export interface UpdateAssignmentRuleInputDto {
  category_id: number;
  assignee: AssigneeGroupDto;
}

export function hasAssignmentRuleAssigneeSelection(
  assignee: AssigneeGroupDto,
): assignee is CreateAssignmentRuleAssigneeDto {
  return (
    assignee.job_field_id.length > 0 || assignee.employee_username.length > 0
  );
}

export type AssignmentRecommendationSourceDto =
  | "employee"
  | "jobField"
  | "mixed";

export interface AssignmentRecommendationInputDto {
  categoryId: string;
  assigneeUsernames: string[];
  language?: Locale;
}

export interface AssignmentRecommendationResultDto {
  recommendedUsers: ImageValueLabel[];
  source: AssignmentRecommendationSourceDto | null;
  selectedCategoryLabel: string;
}
