import { useMutation, useQueryClient } from "@tanstack/react-query";

import { jobFieldApi } from "@/feature/organization/jobField";

import { jobFieldQueryKeys } from "./queryKeys";

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
