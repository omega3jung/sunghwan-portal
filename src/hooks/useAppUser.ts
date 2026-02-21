import { useQuery } from "@tanstack/react-query";

import { AppUser } from "@/domain/user";
import fetcher from "@/services/fetcher";

export const USER_DATA_KEY = "USER-DATA";

// fetch user data.
export const useAppUser = () => {
  return useQuery<AppUser>({
    queryKey: [USER_DATA_KEY],
    queryFn: async () => {
      const res = await fetcher.api.post<AppUser>("/api/me");
      return { ...res.data };
    },
  });
};
