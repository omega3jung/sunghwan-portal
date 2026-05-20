import { useQuery } from "@tanstack/react-query";
import { Session } from "next-auth";

import { userProfileApi } from "@/feature/user/profile";

export const useCurrentUserProfileQuery = (session: Session | null) => {
  const currentUserKey = session?.impersonation
    ? session.impersonation.impersonatedUser.username
    : session?.user.id;

  return useQuery({
    queryKey: ["user-profile", currentUserKey],
    queryFn: () => {
      if (!currentUserKey) throw new Error("No user identifier");

      return session?.impersonation
        ? userProfileApi.get(currentUserKey)
        : userProfileApi.me();
    },
    enabled: !!currentUserKey,
    staleTime: 1000 * 60,
  });
};
