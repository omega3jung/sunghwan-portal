// src/feature/user/preference/queries.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Preference } from "@/domain/user/preference";

import { userPreferenceQueryKeys } from "./queryKeys";
import { userPreferenceRepo } from "./repo";
import { SavePreferenceInput } from "./types";

export const useCreateUserPreference = <T>() => {
  const queryClient = useQueryClient();

  return useMutation<Preference<T> | undefined, Error, SavePreferenceInput<T>>({
    mutationFn: (variables) => userPreferenceRepo.create<T>(variables),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userPreferenceQueryKeys.all });
    },
  });
};

export const useUpdateUserPreference = <T>() => {
  const queryClient = useQueryClient();

  return useMutation<Preference<T> | undefined, Error, SavePreferenceInput<T>>({
    mutationFn: (variables) => userPreferenceRepo.update<T>(variables),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userPreferenceQueryKeys.all });
    },
  });
};
