"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { invalidateServiceDeskTenantDependencies } from "@/feature/serviceDesk/shared/invalidation";

import { companyApi } from "./api";
import { companyQueryKeys } from "./queryKeys";

export const useCreateCompanyMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: companyApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyQueryKeys.all });
      void invalidateServiceDeskTenantDependencies(queryClient);
    },
  });
};

export const useUpdateCompanyMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: companyApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyQueryKeys.all });
      void invalidateServiceDeskTenantDependencies(queryClient);
    },
  });
};

export const useDeleteCompanyMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: companyApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyQueryKeys.all });
      void invalidateServiceDeskTenantDependencies(queryClient);
    },
  });
};
