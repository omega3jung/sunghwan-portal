"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { employeeApi } from "@/feature/organization/employee";

import { employeeQueryKeys } from "./queryKeys";

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
