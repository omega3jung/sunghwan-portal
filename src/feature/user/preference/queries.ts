// src/feature/user/preference/queries.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { userPreferenceQueryKeys } from "./queryKeys";
import { userPreferenceRepo } from "./repo";

export const useFetchUserPreference = (userId: string | null) => {
  return useQuery({
    queryKey: userPreferenceQueryKeys.detail(userId),
    queryFn: () => userPreferenceRepo.fetch(userId),
  });
};

export const usePostUserPreference = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userPreferenceRepo.post,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userPreferenceQueryKeys.all });
    },
  });
};

export const usePutUserPreference = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userPreferenceRepo.put,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userPreferenceQueryKeys.all });
    },
  });
};
