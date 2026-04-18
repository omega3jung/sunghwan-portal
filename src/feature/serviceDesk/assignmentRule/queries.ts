import { useQuery } from "@tanstack/react-query";

import {
  AssignmentRecommendationInput,
  serviceDeskAssignmentRecommendationApi,
  serviceDeskAssignmentRuleApi,
} from "@/api/serviceDesk/assignmentRule";
import { DYNAMIC_QUERY_OPTIONS, STATIC_QUERY_OPTIONS } from "@/lib/reactQuery";
import { DbParams } from "@/shared/types/api";

import { assignmentRuleQueryKeys } from "./queryKeys";

export const useServiceDeskAssignmentRuleListQuery = (params: DbParams) => {
  return useQuery({
    queryKey: assignmentRuleQueryKeys.list(params),
    queryFn: () => serviceDeskAssignmentRuleApi.list(params),
    enabled: !!params,
    ...STATIC_QUERY_OPTIONS,
  });
};

export const useServiceDeskAssignmentRuleQuery = (id: string | number) => {
  return useQuery({
    queryKey: assignmentRuleQueryKeys.detail(id),
    queryFn: () => serviceDeskAssignmentRuleApi.get(id),
    enabled: !!id,
    ...STATIC_QUERY_OPTIONS,
  });
};

export const useServiceDeskAssignmentRecommendationsQuery = (
  input: AssignmentRecommendationInput,
  enabled = true,
) => {
  return useQuery({
    queryKey: assignmentRuleQueryKeys.recommendation(input),
    queryFn: () => serviceDeskAssignmentRecommendationApi.recommend(input),
    enabled: enabled && Boolean(input.categoryId),
    ...DYNAMIC_QUERY_OPTIONS,
  });
};
