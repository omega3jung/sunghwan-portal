import { useQuery } from "@tanstack/react-query";
import { Session } from "next-auth";

import { userProfileApi } from "@/api/user";

export const useMyProfileQuery = (session: Session | null) => {
  const effectiveUserId = session?.impersonation
    ? session.impersonation.subjectId
    : session?.user.id;

  return useQuery({
    queryKey: ["user-profile", effectiveUserId],
    queryFn: () => {
      if (!effectiveUserId) throw new Error("No user id");

      return session?.impersonation
        ? userProfileApi.get(effectiveUserId)
        : userProfileApi.me();
    },
    enabled: !!effectiveUserId,
    staleTime: 1000 * 60,
  });
};
