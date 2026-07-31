"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { employeeApi } from "./api";
import { employeeQueryKeys } from "./queryKeys";

/** Provides the client mutation hook for create employee mutation and invalidates affected cached data. */
export const useCreateEmployeeMutation = () => {
  const queryClient = useQueryClient();

  // message will be handeled where call mutation by useMutationToast.
  return useMutation({
    mutationFn: employeeApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeQueryKeys.all });
    },
  });
};

/** Provides the client mutation hook for update employee mutation and invalidates affected cached data. */
export const useUpdateEmployeeMutation = () => {
  const queryClient = useQueryClient();

  // message will be handeled where call mutation by useMutationToast.
  return useMutation({
    mutationFn: employeeApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeQueryKeys.all });
    },
  });
};

/** Provides the client mutation hook for delete employee mutation and invalidates affected cached data. */
export const useDeleteEmployeeMutation = () => {
  const queryClient = useQueryClient();

  // message will be handeled where call mutation by useMutationToast.
  return useMutation({
    mutationFn: employeeApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeQueryKeys.all });
    },
  });
};
