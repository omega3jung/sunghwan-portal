import { useQuery } from "@tanstack/react-query";

import client from "@/api/client";
import { AppUser } from "@/domain/user";

export const USER_DATA_KEY = "USER-DATA";

// get user data.
export const useAppUser = () => {
  return useQuery<AppUser>({
    queryKey: [USER_DATA_KEY],
    queryFn: async () => {
      const res = await client.api.post<AppUser>("/api/me");
      return { ...res.data };
    },
  });
};
