"use client";

import { useQuery } from "@tanstack/react-query";

import { useCurrentSession } from "@/feature/auth/session/client";

import { getServiceDeskQueryOptions } from "../shared/utils/queryOptions";
import { serviceDeskAssignmentRuleApi } from "./api";
import { assignmentRuleQueryKeys } from "./queryKeys";
import {
  AssignmentRecommendationInput,
  serviceDeskAssignmentRecommendationApi,
} from "./recommendation";
import { ServiceDeskAssignmentRuleListParams } from "./types";

export const useServiceDeskAssignmentRuleListQuery = (
  params?: ServiceDeskAssignmentRuleListParams,
) => {
  const { data: currentSession } = useCurrentSession();
  const dataScope = currentSession?.user.dataScope;
  const ticketQueryOptions = getServiceDeskQueryOptions(dataScope);

  return useQuery({
    queryKey: assignmentRuleQueryKeys.list(params),
    queryFn: () => serviceDeskAssignmentRuleApi.list(params),
    enabled: params !== undefined && !!dataScope,
    ...ticketQueryOptions,
  });
};

export const useServiceDeskAssignmentRecommendationsQuery = (
  input: AssignmentRecommendationInput,
  enabled = true,
) => {
  const { data: currentSession } = useCurrentSession();
  const dataScope = currentSession?.user.dataScope;
  const ticketQueryOptions = getServiceDeskQueryOptions(dataScope);

  return useQuery({
    queryKey: assignmentRuleQueryKeys.recommendation(input),
    queryFn: () => serviceDeskAssignmentRecommendationApi.recommend(input),
    enabled: enabled && Boolean(input.categoryId) && !!dataScope,
    ...ticketQueryOptions,
  });
};
