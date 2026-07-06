import type { ImageValueLabel, Locale } from "@/shared/types";

export interface AssigneeGroupDto {
  job_field_id: number[]; // string number. can use parseInt.
  employee_username: string[];
}

export interface AssignmentRuleDto {
  assignment_rule_id: number;
  category_id: number; // string number. can use parseInt.
  assignee: AssigneeGroupDto;
}

export interface CreateAssignmentRuleInputDto {
  tenant_id: number;
  category_id: number;
  assignee: AssigneeGroupDto;
}

export interface UpdateAssignmentRuleInputDto {
  category_id: number;
  assignee: AssigneeGroupDto;
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
