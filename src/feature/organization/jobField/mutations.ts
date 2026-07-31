"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { jobFieldApi } from "./api";
import { jobFieldQueryKeys } from "./queryKeys";

/** Provides the client mutation hook for create job field mutation and invalidates affected cached data. */
export const useCreateJobFieldMutation = () => {
  const queryClient = useQueryClient();

  // message will be handeled where call mutation by useMutationToast.
  return useMutation({
    mutationFn: jobFieldApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobFieldQueryKeys.all });
    },
  });
};

/** Provides the client mutation hook for update job field mutation and invalidates affected cached data. */
export const useUpdateJobFieldMutation = () => {
  const queryClient = useQueryClient();

  // message will be handeled where call mutation by useMutationToast.
  return useMutation({
    mutationFn: jobFieldApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobFieldQueryKeys.all });
    },
  });
};

/** Provides the client mutation hook for delete job field mutation and invalidates affected cached data. */
export const useDeleteJobFieldMutation = () => {
  const queryClient = useQueryClient();

  // message will be handeled where call mutation by useMutationToast.
  return useMutation({
    mutationFn: jobFieldApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobFieldQueryKeys.all });
    },
  });
};
