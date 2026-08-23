"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { invalidateServiceDeskTenantDependencies } from "../shared/invalidation";
import { serviceDeskTenantApi } from "./api";

export const useCreateServiceDeskTenant = () => {
  const queryTenant = useQueryClient();

  return useMutation({
    mutationFn: serviceDeskTenantApi.create,
    onSuccess: () => {
      void invalidateServiceDeskTenantDependencies(queryTenant);
    },
  });
};

export const useUpdateServiceDeskTenant = () => {
  const queryTenant = useQueryClient();

  return useMutation({
    mutationFn: serviceDeskTenantApi.update,
    onSuccess: () => {
      void invalidateServiceDeskTenantDependencies(queryTenant);
    },
  });
};

export const useDeleteServiceDeskTenant = () => {
  const queryTenant = useQueryClient();

  return useMutation({
    mutationFn: serviceDeskTenantApi.remove,
    onSuccess: () => {
      void invalidateServiceDeskTenantDependencies(queryTenant);
    },
  });
};
