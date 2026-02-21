import { useQuery } from "@tanstack/react-query";

import { AuthUser } from "@/domain/auth";
import { AppUser } from "@/domain/user";
import fetcher from "@/services/fetcher";

export const useDatabaseUser = (user: AuthUser | AppUser) => {
  const userId = user?.id;

  return useQuery({
    queryKey: ["DATABASE_USER", userId],
    queryFn: async () => {
      const res = await fetcher.api.get<AppUser>(`/users/${userId}`);
      return res.data;
    },
    enabled: !!userId,
  });
};
