"use client";

import { useQuery } from "@tanstack/react-query";

import { useServiceDeskQueryOptions } from "../shared/hooks/useServiceDeskQueryOptions";
import { serviceDeskAssignmentRuleApi } from "./api";
import { assignmentRuleQueryKeys } from "./queryKeys";
import {
  AssignmentRecommendationInput,
} from "./recommendation";
import { serviceDeskAssignmentRecommendationApi } from "./recommendationApi";
import { ServiceDeskAssignmentRuleListParams } from "./types";

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
