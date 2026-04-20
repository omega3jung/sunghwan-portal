import { useQuery } from "@tanstack/react-query";
import { Session } from "next-auth";

import { userProfileApi } from "@/api/user";

export const useCurrentUserProfileQuery = (session: Session | null) => {
  const currentUserId = session?.impersonation
    ? session.impersonation.impersonatedUserId
    : session?.user.id;

  return useQuery({
    queryKey: ["user-profile", currentUserId],
    queryFn: () => {
      if (!currentUserId) throw new Error("No user id");

      return session?.impersonation
        ? userProfileApi.get(currentUserId)
        : userProfileApi.me();
    },
    enabled: !!currentUserId,
    staleTime: 1000 * 60,
  });
};
