import { useQuery } from "@tanstack/react-query";
import {
  getUserPreferenceRepository,
  USER_PREFERENCE_KEY,
} from "@/lib/userPreferenceRepo";

export const useFetchUserPreference = () => {
  const repo = getUserPreferenceRepository();

  return useQuery({
    queryKey: [USER_PREFERENCE_KEY],
    queryFn: repo.fetch,
  });
};
