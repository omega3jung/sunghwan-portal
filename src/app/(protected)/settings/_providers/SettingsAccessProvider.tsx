"use client";

import { createContext, useContext, useMemo } from "react";

import { UserScope } from "@/domain/auth";
import { useCurrentSession } from "@/feature/auth/session/client";
import {
  getServiceDeskAdminType,
  type ServiceDeskAdminType,
  type ServiceDeskSettingsPrincipal,
} from "@/lib/application/serviceDesk";

type SettingsAccessContextValue = {
  type: SettingsAccessType | null;
  isForbidden: boolean;
  isChecking: boolean;
  status: ReturnType<typeof useCurrentSession>["status"];
  principal: ServiceDeskSettingsPrincipal;
};

export type SettingsAccessType = Exclude<ServiceDeskAdminType, null>;

const SettingsAccessContext = createContext<SettingsAccessContextValue | null>(
  null,
);

export function SettingsAccessProvider({
  userScope,
  permission,
  companyId,
  children,
}: {
  userScope: UserScope;
  permission: number;
  companyId: string | number;
  children: React.ReactNode;
}) {
  const session = useCurrentSession();
  const { current } = session;
  const currentUser = current.user;
  const impersonatedUsername =
    session.data?.impersonation?.impersonatedUser.username ?? null;
  const isCurrentUserSynced =
    !impersonatedUsername || currentUser?.username === impersonatedUsername;
  const isChecking =
    session.status === "loading" || !currentUser || !isCurrentUserSynced;

  const value = useMemo<SettingsAccessContextValue>(() => {
    const resolvedUserScope = currentUser?.userScope ?? userScope;
    const resolvedPermission = currentUser?.permission ?? permission;
    const resolvedCompanyId = currentUser?.companyId ?? companyId;
    const principal = {
      permission: resolvedPermission,
      userScope: resolvedUserScope,
      companyId: resolvedCompanyId,
    } satisfies ServiceDeskSettingsPrincipal;

    const type = getServiceDeskAdminType(principal);

    return {
      type,
      isForbidden: Boolean(currentUser && isCurrentUserSynced && !type),
      isChecking,
      status: session.status,
      principal,
    };
  }, [
    companyId,
    currentUser,
    isChecking,
    isCurrentUserSynced,
    permission,
    session.status,
    userScope,
  ]);

  return (
    <SettingsAccessContext.Provider value={value}>
      {children}
    </SettingsAccessContext.Provider>
  );
}

export function useSettingsAccess() {
  const ctx = useContext(SettingsAccessContext);
  if (!ctx) {
    throw new Error(
      "useSettingsAccess must be used within SettingsAccessProvider",
    );
  }
  return ctx;
}
