"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { serviceDeskTenantApi } from "@/feature/serviceDesk/tenant";

import { tenantQueryKeys } from "./queryKeys";

export const useCreateServiceDeskTenant = () => {
  const queryTenant = useQueryClient();

  // message will be handeled where call mutation by useMutationToast.
  return useMutation({
    mutationFn: serviceDeskTenantApi.create,
    onSuccess: () => {
      queryTenant.invalidateQueries({ queryKey: tenantQueryKeys.all });
    },
  });
};

export const useUpdateServiceDeskTenant = () => {
  const queryTenant = useQueryClient();

  // message will be handeled where call mutation by useMutationToast.
  return useMutation({
    mutationFn: serviceDeskTenantApi.update,
    onSuccess: () => {
      queryTenant.invalidateQueries({ queryKey: tenantQueryKeys.all });
    },
  });
};

export const useDeleteServiceDeskTenant = () => {
  const queryTenant = useQueryClient();

  // message will be handeled where call mutation by useMutationToast.
  return useMutation({
    mutationFn: serviceDeskTenantApi.remove,
    onSuccess: () => {
      queryTenant.invalidateQueries({ queryKey: tenantQueryKeys.all });
    },
  });
};

export const useSaveServiceDeskTenantList = () => {
  const queryTenant = useQueryClient();

  // message will be handeled where call mutation by useMutationToast.
  return useMutation({
    mutationFn: serviceDeskTenantApi.saveList,
    onSuccess: async () => {
      await queryTenant.invalidateQueries({
        queryKey: tenantQueryKeys.all,
      });
    },
  });
};
