import { useEffect } from "react";

import { useAppUser } from "@/hooks/useAppUser";
import { useCurrentSession } from "@/hooks/useCurrentSession";
import { useFetchUserPreference } from "@/hooks/useUserPreference";
import { useImpersonationStore } from "@/lib/impersonationStore";

type Props = {
  children: React.ReactNode;
};

export const AppUserProvider = ({ children }: Props) => {
  const { current } = useCurrentSession();
  const impersonation = useImpersonationStore();

  const userId = current.user?.id;
  const appUserQuery = useAppUser(userId);
  const preferenceQuery = useFetchUserPreference();

  useEffect(() => {
    if (!current.user) return;

    // demo user
    if (current.user.id === "demo") {
      impersonation.setActor({
        ...current.user,
        permission: "GUEST",
        preference: preferenceQuery.data,
        canUseSuperUser: false,
      });
      return;
    }

    // remote user
    if (!appUserQuery.data) return;

    impersonation.setActor({
      ...appUserQuery.data,
      preference: preferenceQuery.data,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current.user, appUserQuery.data, preferenceQuery.data]);

  return <>{children}</>;
};
