"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { serviceDeskCategoryApi } from "./api";
import { categoryQueryKeys } from "./queryKeys";

/** Provides the client mutation hook for save service desk category tree and invalidates affected cached data. */
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
