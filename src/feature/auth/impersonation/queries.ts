"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { userImpersonationApi } from "./api";
import { userImpersonationQueryKeys } from "./queryKeys";

/** Provides the client query hook for start user impersonation and its cache policy. */
export const useStartUserImpersonation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userImpersonationApi.start,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: userImpersonationQueryKeys.all,
      });
    },
  });
};

/** Provides the client query hook for stop user impersonation and its cache policy. */
export const useStopUserImpersonation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userImpersonationApi.stop,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: userImpersonationQueryKeys.all,
      });
    },
  });
};
