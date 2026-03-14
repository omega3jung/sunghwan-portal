// src/feature/user/profile/queries.ts
import { useQuery } from "@tanstack/react-query";

import { userProfileApi } from "@/api/user";

import { userProfileQueryKeys } from "./queryKeys";

export const useUserProfileQuery = (userId: string) => {
  return useQuery({
    queryKey: userProfileQueryKeys.detail(userId),
    queryFn: () => userProfileApi.get(userId),
    enabled: !!userId,
  });
};
