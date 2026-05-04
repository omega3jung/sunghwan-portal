"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { serviceDeskAssignmentRuleApi } from "@/feature/serviceDesk/assignmentRule";

import { assignmentRuleQueryKeys } from "./queryKeys";

export const useCreateServiceDeskAssignmentRule = () => {
  const queryClient = useQueryClient();

  // message will be handeled where call mutation by useMutationToast.
  return useMutation({
    mutationFn: serviceDeskAssignmentRuleApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: assignmentRuleQueryKeys.all,
      });
    },
  });
};

export const useUpdateServiceDeskAssignmentRule = () => {
  const queryClient = useQueryClient();

  // message will be handeled where call mutation by useMutationToast.
  return useMutation({
    mutationFn: serviceDeskAssignmentRuleApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: assignmentRuleQueryKeys.all,
      });
    },
  });
};

export const useDeleteServiceDeskAssignmentRule = () => {
  const queryClient = useQueryClient();

  // message will be handeled where call mutation by useMutationToast.
  return useMutation({
    mutationFn: serviceDeskAssignmentRuleApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: assignmentRuleQueryKeys.all,
      });
    },
  });
};

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
