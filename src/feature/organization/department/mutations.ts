"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { invalidateAssignmentRuleRecommendations } from "@/feature/serviceDesk/assignmentRule/invalidation";

import { departmentApi } from "./api";
import { departmentQueryKeys } from "./queryKeys";

export const useCreateDepartmentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: departmentApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: departmentQueryKeys.all });
      void invalidateAssignmentRuleRecommendations(queryClient);
    },
  });
};

export const useUpdateDepartmentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: departmentApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: departmentQueryKeys.all });
      void invalidateAssignmentRuleRecommendations(queryClient);
    },
  });
};

export const useDeleteDepartmentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: departmentApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: departmentQueryKeys.all });
      void invalidateAssignmentRuleRecommendations(queryClient);
    },
  });
};
