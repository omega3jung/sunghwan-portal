"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { serviceDeskAssignmentRuleApi } from "./api";
import { assignmentRuleQueryKeys } from "./queryKeys";

export const useSaveServiceDeskAssignmentRuleTree = () => {
  const queryClient = useQueryClient();

  // message will be handeled where call mutation by useMutationToast.
  return useMutation({
    mutationFn: serviceDeskAssignmentRuleApi.saveTree,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: assignmentRuleQueryKeys.all,
      });
    },
  });
};
