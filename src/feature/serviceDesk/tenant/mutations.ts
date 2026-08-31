"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { serviceDeskTenantApi } from "./api";
import { invalidateTenantMutationQueries } from "./invalidation";

export const useCreateServiceDeskTenant = () => {
  const queryTenant = useQueryClient();

  return useMutation({
    mutationFn: serviceDeskTenantApi.create,
    onSuccess: () => {
      void invalidateTenantMutationQueries(queryTenant);
    },
  });
};

export const useUpdateServiceDeskTenant = () => {
  const queryTenant = useQueryClient();

  return useMutation({
    mutationFn: serviceDeskTenantApi.update,
    onSuccess: () => {
      void invalidateTenantMutationQueries(queryTenant);
    },
  });
};

export const useDeleteServiceDeskTenant = () => {
  const queryTenant = useQueryClient();

  return useMutation({
    mutationFn: serviceDeskTenantApi.remove,
    onSuccess: () => {
      void invalidateTenantMutationQueries(queryTenant);
    },
  });
};
