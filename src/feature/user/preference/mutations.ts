// src/feature/user/preference/queries.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { userPreferenceQueryKeys } from "./queryKeys";
import { userPreferenceRepo } from "./repo";

export const useCreateUserPreference = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userPreferenceRepo.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userPreferenceQueryKeys.all });
    },
  });
};

export const useUpdateUserPreference = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userPreferenceRepo.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userPreferenceQueryKeys.all });
    },
  });
};
