"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { serviceDeskTenantApi } from "./api";
import { tenantQueryKeys } from "./queryKeys";

export const useCreateServiceDeskTenant = () => {
  const queryTenant = useQueryClient();

  // message will be handeled where call mutation by useMutationToast.
  return useMutation({
    mutationFn: serviceDeskTenantApi.create,
    onSuccess: () => {
      queryTenant.invalidateQueries({ queryKey: tenantQueryKeys.lists() });
    },
  });
};

export const useUpdateServiceDeskTenant = () => {
  const queryTenant = useQueryClient();

  // message will be handeled where call mutation by useMutationToast.
  return useMutation({
    mutationFn: serviceDeskTenantApi.update,
    onSuccess: () => {
      queryTenant.invalidateQueries({ queryKey: tenantQueryKeys.lists() });
    },
  });
};

export const useDeleteServiceDeskTenant = () => {
  const queryTenant = useQueryClient();

  // message will be handeled where call mutation by useMutationToast.
  return useMutation({
    mutationFn: serviceDeskTenantApi.remove,
    onSuccess: () => {
      queryTenant.invalidateQueries({ queryKey: tenantQueryKeys.lists() });
    },
  });
};
