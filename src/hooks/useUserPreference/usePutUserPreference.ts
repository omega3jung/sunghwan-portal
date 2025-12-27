import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getUserPreferenceRepository,
  USER_PREFERENCE_KEY,
} from "@/lib/userPreferenceRepo";

export const usePutUserPreference = () => {
  const repo = getUserPreferenceRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: repo.put,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USER_PREFERENCE_KEY] });
    },
  });
};
