// src/feature/user/profile/queries.ts
import { useQuery } from "@tanstack/react-query";

import { userProfileApi } from "./api";
import { userProfileQueryKeys } from "./queryKeys";

/** Provides the client query hook for user profile query and its cache policy. */
export const useUserProfileQuery = (userId: string) => {
  return useQuery({
    queryKey: userProfileQueryKeys.detail(userId),
    queryFn: () => userProfileApi.get(userId),
    enabled: !!userId,
  });
};
