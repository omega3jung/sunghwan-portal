"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { departmentApi } from "./api";
import { departmentQueryKeys } from "./queryKeys";

/** Provides the client mutation hook for create department mutation and invalidates affected cached data. */
export const useCreateDepartmentMutation = () => {
  const queryClient = useQueryClient();

  // message will be handeled where call mutation by useMutationToast.
  return useMutation({
    mutationFn: departmentApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: departmentQueryKeys.all });
    },
  });
};

/** Provides the client mutation hook for update department mutation and invalidates affected cached data. */
export const useUpdateDepartmentMutation = () => {
  const queryClient = useQueryClient();

  // message will be handeled where call mutation by useMutationToast.
  return useMutation({
    mutationFn: departmentApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: departmentQueryKeys.all });
    },
  });
};

/** Provides the client mutation hook for delete department mutation and invalidates affected cached data. */
export const useDeleteDepartmentMutation = () => {
  const queryClient = useQueryClient();

  // message will be handeled where call mutation by useMutationToast.
  return useMutation({
    mutationFn: departmentApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: departmentQueryKeys.all });
    },
  });
};
