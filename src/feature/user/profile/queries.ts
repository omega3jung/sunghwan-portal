// src/feature/user/preference/queries.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { userProfileApi } from "./api";
import { userProfileQueryKeys } from "./queryKeys";

export const useFetchUserProfile = (userId: string) => {
  return useQuery({
    queryKey: userProfileQueryKeys.detail(userId),
    queryFn: () => userProfileApi.fetch(userId),
    enabled: !!userId,
  });
};

export const usePostUserProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userProfileApi.post,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userProfileQueryKeys.all });
    },
  });
};

export const usePutUserProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userProfileApi.put,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userProfileQueryKeys.all });
    },
  });
};
