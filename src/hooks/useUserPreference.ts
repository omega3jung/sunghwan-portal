import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  USER_PREFERENCE_KEY,
  userPreferenceRepo,
} from "@/lib/repo/userPreferenceRepo";

export const useFetchUserPreference = () => {
  return useQuery({
    queryKey: [USER_PREFERENCE_KEY],
    queryFn: userPreferenceRepo.fetch,
  });
};

export const usePostUserPreference = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userPreferenceRepo.post,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USER_PREFERENCE_KEY] });
    },
  });
};

export const usePutUserPreference = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userPreferenceRepo.put,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USER_PREFERENCE_KEY] });
    },
  });
};
