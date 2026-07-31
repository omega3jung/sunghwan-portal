"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { employeeQueryKeys } from "@/feature/organization/employee";

import { serviceDeskAssignmentRuleApi } from "./api";
import { assignmentRuleQueryKeys } from "./queryKeys";

/** Provides the client mutation hook for save service desk assignment rule tree and invalidates affected cached data. */
export const useSaveServiceDeskAssignmentRuleTree = () => {
  const queryClient = useQueryClient();

  // message will be handeled where call mutation by useMutationToast.
  return useMutation({
    mutationFn: serviceDeskAssignmentRuleApi.saveTree,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: assignmentRuleQueryKeys.all,
        }),
        queryClient.invalidateQueries({
          queryKey: employeeQueryKeys.lists(),
        }),
      ]);
    },
  });
};
