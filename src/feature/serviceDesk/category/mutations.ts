"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { serviceDeskCategoryApi } from "./api";
import { categoryQueryKeys } from "./queryKeys";

export const useSaveServiceDeskCategoryTree = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: serviceDeskCategoryApi.saveTree,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: categoryQueryKeys.all,
      });
    },
  });
};
