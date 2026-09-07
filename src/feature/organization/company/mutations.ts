"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { invalidateTenantMutationQueries } from "@/feature/serviceDesk/tenant/invalidation";

import { companyApi } from "./api";
import { companyQueryKeys } from "./queryKeys";

export const useCreateCompanyMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: companyApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyQueryKeys.all });
      void invalidateTenantMutationQueries(queryClient);
    },
  });
};

export const useUpdateCompanyMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: companyApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyQueryKeys.all });
      void invalidateTenantMutationQueries(queryClient);
    },
  });
};

export const useDeleteCompanyMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: companyApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyQueryKeys.all });
      void invalidateTenantMutationQueries(queryClient);
    },
  });
};
