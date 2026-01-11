import { useQuery } from "@tanstack/react-query";

import fetcher from "@/services/fetcher";
import { AppUser, AuthUser } from "@/types";

export const useDatabaseUser = (user: AuthUser | AppUser) => {
  const userId = user?.id;

  return useQuery({
    queryKey: ["DATABASE_USER", userId],
    queryFn: async () => {
      const res = await fetcher.api<AppUser>(`/users/${userId}`);
      return res.data;
    },
    enabled: !!userId,
  });
};
