"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { invalidateServiceDeskOrganizationDependencies } from "@/feature/serviceDesk/shared/invalidation";

import { employeeApi } from "./api";
import { employeeQueryKeys } from "./queryKeys";

export const useCreateEmployeeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: employeeApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeQueryKeys.all });
      void invalidateServiceDeskOrganizationDependencies(queryClient);
    },
  });
};

export const useUpdateEmployeeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: employeeApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeQueryKeys.all });
      void invalidateServiceDeskOrganizationDependencies(queryClient);
    },
  });
};

export const useDeleteEmployeeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: employeeApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeQueryKeys.all });
      void invalidateServiceDeskOrganizationDependencies(queryClient);
    },
  });
};
