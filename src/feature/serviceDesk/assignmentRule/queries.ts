import { useQuery } from "@tanstack/react-query";

import {
  AssignmentRecommendationInput,
  serviceDeskAssignmentRecommendationApi,
  serviceDeskAssignmentRuleApi,
} from "@/feature/serviceDesk/assignmentRule";
import { DYNAMIC_QUERY_OPTIONS, STATIC_QUERY_OPTIONS } from "@/lib/reactQuery";

import { assignmentRuleQueryKeys } from "./queryKeys";
import { ServiceDeskAssignmentRuleListParams } from "./types";

export const useServiceDeskAssignmentRuleListQuery = (
  params?: ServiceDeskAssignmentRuleListParams,
) => {
  return useQuery({
    queryKey: assignmentRuleQueryKeys.list(params),
    queryFn: () => serviceDeskAssignmentRuleApi.list(params),
    enabled: params !== undefined,
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
