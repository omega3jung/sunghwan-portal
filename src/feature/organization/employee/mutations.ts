"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { invalidateAssignmentRuleRecommendations } from "@/feature/serviceDesk/assignmentRule/invalidation";

import { employeeApi } from "./api";
import { employeeQueryKeys } from "./queryKeys";

export const useCreateEmployeeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: employeeApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeQueryKeys.all });
      void invalidateAssignmentRuleRecommendations(queryClient);
    },
  });
};

export const useUpdateEmployeeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: employeeApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeQueryKeys.all });
      void invalidateAssignmentRuleRecommendations(queryClient);
    },
  });
};

export const useDeleteEmployeeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: employeeApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeQueryKeys.all });
      void invalidateAssignmentRuleRecommendations(queryClient);
    },
  });
};
