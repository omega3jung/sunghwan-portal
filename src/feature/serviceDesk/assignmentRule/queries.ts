"use client";

import { useQuery } from "@tanstack/react-query";

import type {
  AssignmentRecommendationInput,
  ServiceDeskAssignmentRuleListParams,
} from "@/lib/application/contracts/serviceDesk";

import { useServiceDeskQueryOptions } from "../shared/hooks/useServiceDeskQueryOptions";
import { serviceDeskAssignmentRuleApi } from "./api";
import { assignmentRuleQueryKeys } from "./queryKeys";
import { serviceDeskAssignmentRecommendationApi } from "./recommendationApi";

/** Provides the client query hook for service desk assignment rule list query and its cache policy. */
export const useServiceDeskAssignmentRuleListQuery = (
  params?: ServiceDeskAssignmentRuleListParams,
) => {
  const { dataScope, queryOptions } = useServiceDeskQueryOptions();

  return useQuery({
    queryKey: assignmentRuleQueryKeys.list(params),
    queryFn: () => serviceDeskAssignmentRuleApi.list(params),
    enabled: params !== undefined && !!dataScope,
    ...queryOptions,
  });
};

/** Provides the client query hook for service desk assignment recommendations query and its cache policy. */
export const useServiceDeskAssignmentRecommendationsQuery = (
  input: AssignmentRecommendationInput,
  enabled = true,
) => {
  const { dataScope, queryOptions } = useServiceDeskQueryOptions();

  return useQuery({
    queryKey: assignmentRuleQueryKeys.recommendation(input),
    queryFn: () => serviceDeskAssignmentRecommendationApi.recommend(input),
    enabled: enabled && Boolean(input.categoryId) && !!dataScope,
    ...queryOptions,
  });
};
