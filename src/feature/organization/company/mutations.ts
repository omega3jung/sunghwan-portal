"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { companyApi } from "./api";
import { companyQueryKeys } from "./queryKeys";

export const useCreateCompanyMutation = () => {
  const queryClient = useQueryClient();

  // message will be handeled where call mutation by useMutationToast.
  return useMutation({
    mutationFn: companyApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyQueryKeys.all });
    },
  });
};

export const useUpdateCompanyMutation = () => {
  const queryClient = useQueryClient();

  // message will be handeled where call mutation by useMutationToast.
  return useMutation({
    mutationFn: companyApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyQueryKeys.all });
    },
  });
};

export const useDeleteCompanyMutation = () => {
  const queryClient = useQueryClient();

  // message will be handeled where call mutation by useMutationToast.
  return useMutation({
    mutationFn: companyApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyQueryKeys.all });
    },
  });
};
