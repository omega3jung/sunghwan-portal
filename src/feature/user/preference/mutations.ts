// src/feature/user/preference/mutations.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Preference } from "@/domain/user/preference";

import { userPreferenceQueryKeys } from "./queryKeys";
import { userPreferenceRepo } from "./repo";
import { SavePreferenceInput } from "./types";

/** Provides the client mutation hook for create user preference and invalidates affected cached data. */
export const useCreateUserPreference = <T>() => {
  const queryClient = useQueryClient();

  return useMutation<Preference<T> | undefined, Error, SavePreferenceInput<T>>({
    mutationFn: (variables) => userPreferenceRepo.create<T>(variables),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userPreferenceQueryKeys.all });
    },
  });
};

/** Provides the client mutation hook for update user preference and invalidates affected cached data. */
export const useUpdateUserPreference = <T>() => {
  const queryClient = useQueryClient();

  return useMutation<Preference<T> | undefined, Error, SavePreferenceInput<T>>({
    mutationFn: (variables) => userPreferenceRepo.update<T>(variables),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userPreferenceQueryKeys.all });
    },
  });
};
