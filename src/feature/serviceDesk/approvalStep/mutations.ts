"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { employeeQueryKeys } from "@/feature/organization/employee";

import { serviceDeskApprovalStepApi } from "./api";
import { approvalStepQueryKeys } from "./queryKeys";

export const useSaveServiceDeskApprovalStepTree = () => {
  const queryClient = useQueryClient();

  // message will be handeled where call mutation by useMutationToast.
  return useMutation({
    mutationFn: serviceDeskApprovalStepApi.saveTree,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: approvalStepQueryKeys.all,
        }),
        queryClient.invalidateQueries({
          queryKey: employeeQueryKeys.lists(),
        }),
      ]);
    },
  });
};
