import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getUserPreferenceRepository,
  USER_PREFERENCE_KEY,
} from "@/lib/userPreferenceRepo";

export const usePostUserPreference = () => {
  const repo = getUserPreferenceRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: repo.post,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USER_PREFERENCE_KEY] });
    },
  });
};
