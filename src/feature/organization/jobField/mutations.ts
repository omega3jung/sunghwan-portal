"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { jobFieldApi } from "./api";
import { jobFieldQueryKeys } from "./queryKeys";

export const useCreateJobFieldMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: jobFieldApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobFieldQueryKeys.all });
    },
  });
};

export const useUpdateJobFieldMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: jobFieldApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobFieldQueryKeys.all });
    },
  });
};

export const useDeleteJobFieldMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: jobFieldApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobFieldQueryKeys.all });
    },
  });
};
