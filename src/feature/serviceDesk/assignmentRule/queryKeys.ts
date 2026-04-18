import {
  SERVICE_DESK_ASSIGNMENT_RULE_KEY,
  SERVICE_DESK_KEY,
} from "@/feature/serviceDesk/keys";
import type { AssignmentRecommendationInput } from "@/api/serviceDesk/assignmentRule";
import { DbParams } from "@/shared/types/api";

export const assignmentRuleQueryKeys = {
  all: [SERVICE_DESK_KEY, SERVICE_DESK_ASSIGNMENT_RULE_KEY] as const,

  lists: () => [...assignmentRuleQueryKeys.all, "list"] as const,
  list: (params: DbParams) =>
    [...assignmentRuleQueryKeys.lists(), params] as const,

  details: () => [...assignmentRuleQueryKeys.all, "detail"] as const,
  detail: (id: string | number) =>
    [...assignmentRuleQueryKeys.details(), id] as const,

  recommendations: () =>
    [...assignmentRuleQueryKeys.all, "recommendations"] as const,
  recommendation: (input: AssignmentRecommendationInput) =>
    [...assignmentRuleQueryKeys.recommendations(), input] as const,
};
