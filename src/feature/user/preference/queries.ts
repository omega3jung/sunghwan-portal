// src/feature/user/preference/queries.ts
import { useQuery } from "@tanstack/react-query";

import { userPreferenceQueryKeys } from "./queryKeys";
import { userPreferenceRepo } from "./repo";

export const useUserPreferenceQuery = (userId: string | null) => {
  return useQuery({
    queryKey: userPreferenceQueryKeys.detail(userId),
    queryFn: () => userPreferenceRepo.get(userId),
  });
};
