import { useMutation, useQueryClient } from "@tanstack/react-query";

import { serviceDeskApprovalStepApi } from "@/api/serviceDesk/approvalStep";

import { approvalStepQueryKeys } from "./queryKeys";

export const useCreateServiceDeskApprovalStep = () => {
  const queryClient = useQueryClient();

  // message will be handeled where call mutation by useMutationToast.
  return useMutation({
    mutationFn: serviceDeskApprovalStepApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: approvalStepQueryKeys.all });
    },
  });
};

export const useUpdateServiceDeskApprovalStep = () => {
  const queryClient = useQueryClient();

  // message will be handeled where call mutation by useMutationToast.
  return useMutation({
    mutationFn: serviceDeskApprovalStepApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: approvalStepQueryKeys.all });
    },
  });
};

// message will be handeled where call mutation by useMutationToast.
export const useDeleteServiceDeskApprovalStep = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: serviceDeskApprovalStepApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: approvalStepQueryKeys.all });
    },
  });
};
