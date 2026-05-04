import { useQuery } from "@tanstack/react-query";

import { AuthUser } from "@/domain/auth";
import { AppUser } from "@/domain/user";
import client from "@/lib/api";

/**
 * Fetches the persisted database user record for a given authenticated or application user.
 *
 * Use for:
 * - Loading additional user fields that are stored outside the auth session
 * - Querying a user record when a component only has a lightweight auth user object
 *
 * @param user - The authenticated or application user whose database record should be loaded
 * @returns A react-query result for the requested `AppUser`, disabled when the user has no id
 */
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
