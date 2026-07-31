"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { serviceDeskTenantApi } from "./api";
import { tenantQueryKeys } from "./queryKeys";

/** Provides the client mutation hook for create service desk tenant and invalidates affected cached data. */
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

/** Provides the client mutation hook for update service desk tenant and invalidates affected cached data. */
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

/** Provides the client mutation hook for delete service desk tenant and invalidates affected cached data. */
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
