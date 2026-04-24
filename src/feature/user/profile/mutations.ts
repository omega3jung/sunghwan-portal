// src/feature/user/profile/queries.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { userProfileApi } from "./api";
import { userProfileQueryKeys } from "./queryKeys";

export const useCreateUserProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userProfileApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userProfileQueryKeys.all });
    },
  });
};

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userProfileApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userProfileQueryKeys.all });
    },
  });
};
