import { useQuery } from "@tanstack/react-query";

import { AppUser } from "@/domain/user";
import client from "@/lib/api";

export const USER_DATA_KEY = "USER-DATA";

/**
 * Fetches the currently authenticated application user profile.
 *
 * Use for:
 * - Loading the signed-in user's profile data in client features
 * - Reusing a shared react-query cache entry for the current user
 *
 * @param none - This hook does not accept any arguments
 * @returns A react-query result containing the current `AppUser` request state and data
 */
export const useAppUser = () => {
  return useQuery<AppUser>({
    queryKey: [USER_DATA_KEY],
    queryFn: async () => {
      const res = await client.api.post<AppUser>("/api/me");
      return { ...res.data };
    },
  });
};
