// src/feature/user/preference/queries.ts
import { useQuery } from "@tanstack/react-query";

import { userPreferenceQueryKeys } from "./queryKeys";
import { userPreferenceRepo } from "./repo";
import { GetPreferenceInput } from "./types";

/** Provides the client query hook for user preference query and its cache policy. */
export const useUserPreferenceQuery = <T>(params: GetPreferenceInput) => {
  return useQuery({
    queryKey: userPreferenceQueryKeys.detail(params),
    queryFn: () => userPreferenceRepo.get<T>(params),
  });
};
