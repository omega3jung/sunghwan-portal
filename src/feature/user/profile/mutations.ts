// src/feature/user/profile/mutations.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { userProfileApi } from "./api";
import { userProfileQueryKeys } from "./queryKeys";

/** Provides the client mutation hook for create user profile and invalidates affected cached data. */
export const useCreateUserProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userProfileApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userProfileQueryKeys.all });
    },
  });
};

/** Provides the client mutation hook for update user profile and invalidates affected cached data. */
export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userProfileApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userProfileQueryKeys.all });
    },
  });
};
