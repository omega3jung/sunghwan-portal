import { useQuery } from "@tanstack/react-query";

import { useCurrentSession } from "@/feature/auth";
import {
  AssignmentRecommendationInput,
  serviceDeskAssignmentRecommendationApi,
  serviceDeskAssignmentRuleApi,
} from "@/feature/serviceDesk/assignmentRule";

import { getServiceDeskQueryOptions } from "../shared/utils/queryOptions";
import { assignmentRuleQueryKeys } from "./queryKeys";
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
    enabled: params !== undefined,
    ...ticketQueryOptions,
  });
};

export const useServiceDeskAssignmentRuleQuery = (id: string | number) => {
  const { data: currentSession } = useCurrentSession();
  const dataScope = currentSession?.user.dataScope;
  const ticketQueryOptions = getServiceDeskQueryOptions(dataScope);
  return useQuery({
    queryKey: assignmentRuleQueryKeys.detail(id),
    queryFn: () => serviceDeskAssignmentRuleApi.get(id),
    enabled: !!id,
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
    enabled: enabled && Boolean(input.categoryId),
    ...ticketQueryOptions,
  });
};
