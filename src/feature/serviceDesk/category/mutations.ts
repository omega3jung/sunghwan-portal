"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { serviceDeskCategoryApi } from "./api";
import { categoryQueryKeys } from "./queryKeys";

export const useSaveServiceDeskCategoryTree = () => {
  const queryClient = useQueryClient();

  // message will be handeled where call mutation by useMutationToast.
  return useMutation({
    mutationFn: serviceDeskCategoryApi.saveTree,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: categoryQueryKeys.all,
      });
    },
  });
};
