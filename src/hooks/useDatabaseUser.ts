import { useQuery } from "@tanstack/react-query";

import client from "@/api/client";
import { AuthUser } from "@/domain/auth";
import { AppUser } from "@/domain/user";

export const useDatabaseUser = (user: AuthUser | AppUser) => {
  const userId = user?.id;

  return useQuery({
    queryKey: ["DATABASE_USER", userId],
    queryFn: async () => {
      const res = await client.api.get<AppUser>(`/users/${userId}`);
      return res.data;
    },
    enabled: !!userId,
  });
};
