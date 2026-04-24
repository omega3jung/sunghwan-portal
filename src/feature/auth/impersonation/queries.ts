import { useMutation, useQueryClient } from "@tanstack/react-query";

import { userImpersonationApi } from "./api";
import { userImpersonationQueryKeys } from "./queryKeys";

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
