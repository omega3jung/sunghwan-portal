import { useQuery } from "@tanstack/react-query";

import fetcher from "@/services/fetcher";
import { AppUser } from "@/types";

export const USER_DATA_KEY = "USER-DATA";

// fetch user data.
export const useAppUser = (userId: string) => {
  return useQuery<AppUser>({
    queryKey: [USER_DATA_KEY, userId],
    queryFn: async () => {
      const res = await fetcher.api.post<AppUser>("/auth/user", { userId });
      return { ...res.data, dataScope: "REMOTE" };
    },
    enabled: !!userId,
  });
};
