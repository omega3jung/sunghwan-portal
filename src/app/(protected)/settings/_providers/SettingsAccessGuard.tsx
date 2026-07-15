"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { useCurrentSession } from "@/feature/auth/session/client";
import { NS } from "@/lib/i18n";
import { getServiceDeskAdminType } from "@/shared/utils/serviceDesk";

const SETTINGS_ACCESS_TOAST_ID = "settings-access-guard:forbidden";
const SETTINGS_AUTH_TOAST_ID = "settings-access-guard:unauthenticated";

export function SettingsAccessGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const session = useCurrentSession();
  const { t } = useTranslation(NS.auth);

  const currentUser = session.current.user;
  const impersonatedUsername =
    session.data?.impersonation?.impersonatedUser.username ?? null;
  const isCurrentUserSynced =
    !impersonatedUsername || currentUser?.username === impersonatedUsername;
  const isChecking =
    session.status === "loading" || !currentUser || !isCurrentUserSynced;
  const isForbidden =
    !!currentUser &&
    isCurrentUserSynced &&
    !getServiceDeskAdminType(currentUser);

  useEffect(() => {
    if (session.status === "unauthenticated") {
      toast.warning(t("settingsAccessGuard.unauthenticated.title"), {
        id: SETTINGS_AUTH_TOAST_ID,
        description: t("settingsAccessGuard.unauthenticated.description"),
        position: "top-center",
      });
      router.replace("/login");
      return;
    }

    if (isForbidden) {
      toast.warning(t("settingsAccessGuard.forbidden.title"), {
        id: SETTINGS_ACCESS_TOAST_ID,
        description: t("settingsAccessGuard.forbidden.description"),
        position: "top-center",
      });
      router.replace("/");
    }
  }, [isForbidden, router, session.status, t]);

  if (isChecking || isForbidden || session.status === "unauthenticated") {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
