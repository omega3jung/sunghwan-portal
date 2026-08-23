"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { invalidateServiceDeskOrganizationDependencies } from "@/feature/serviceDesk/shared/invalidation";

import { jobFieldApi } from "./api";
import { jobFieldQueryKeys } from "./queryKeys";

export const useCreateJobFieldMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: jobFieldApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobFieldQueryKeys.all });
      void invalidateServiceDeskOrganizationDependencies(queryClient);
    },
  });
};

export const useUpdateJobFieldMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: jobFieldApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobFieldQueryKeys.all });
      void invalidateServiceDeskOrganizationDependencies(queryClient);
    },
  });
};

export const useDeleteJobFieldMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: jobFieldApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobFieldQueryKeys.all });
      void invalidateServiceDeskOrganizationDependencies(queryClient);
    },
  });
};
