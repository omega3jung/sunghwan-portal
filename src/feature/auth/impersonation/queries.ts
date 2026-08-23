"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { STATIC_QUERY_OPTIONS } from "@/lib/client/query";

import { userImpersonationApi } from "./api";
import { userImpersonationQueryKeys } from "./queryKeys";

export const useEligibleImpersonationEmployeeListQuery = (
  companyId?: string | null,
) => {
  return useQuery({
    queryKey: userImpersonationQueryKeys.eligibleEmployees(companyId),
    queryFn: () =>
      companyId
        ? userImpersonationApi.listEligibleEmployees(companyId)
        : Promise.resolve([]),
    enabled: !!companyId,
    ...STATIC_QUERY_OPTIONS,
  });
};

export const useStartUserImpersonation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userImpersonationApi.start,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: userImpersonationQueryKeys.all,
      });
    },
  });
};

export const useStopUserImpersonation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userImpersonationApi.stop,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: userImpersonationQueryKeys.all,
      });
    },
  });
};
