import { useQuery } from "@tanstack/react-query";
import { Session } from "next-auth";

import { userProfileQueryKeys } from "@/feature/user/profile/queryKeys";

import { userProfileApi } from "../api";

/** Provides the client query hook for current user profile query and its cache policy. */
export const useCurrentUserProfileQuery = (session: Session | null) => {
  const impersonatedUsername =
    session?.impersonation?.impersonatedUser.username ?? null;
  const sessionUsername = session?.user.username ?? null;
  const effectiveUsername = impersonatedUsername ?? sessionUsername;
  const isImpersonating = !!impersonatedUsername;

  return useQuery({
    queryKey: userProfileQueryKeys.detail(effectiveUsername),
    queryFn: () => {
      if (!effectiveUsername) throw new Error("No user identifier");

      return isImpersonating
        ? userProfileApi.get(effectiveUsername)
        : userProfileApi.me();
    },
    enabled: !!effectiveUsername,
    staleTime: 30_000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};
