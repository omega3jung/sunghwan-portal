"use client";

import { createContext, useContext, useMemo } from "react";

import { UserScope } from "@/domain/auth";
import { useCurrentSession } from "@/feature/auth/session/client";
import {
  getServiceDeskAdminType,
  type ServiceDeskAdminType,
  type ServiceDeskSettingsPrincipal,
} from "@/shared/utils/serviceDesk";

type SettingsScopeContextValue = {
  adminType: ServiceDeskAdminType;
  principal: ServiceDeskSettingsPrincipal;
};

const SettingsScopeContext = createContext<SettingsScopeContextValue | null>(
  null,
);

export function SettingsScopeProvider({
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
  const { current } = useCurrentSession();
  const currentUser = current.user;

  const value = useMemo<SettingsScopeContextValue>(() => {
    const resolvedUserScope = currentUser?.userScope ?? userScope;
    const resolvedPermission = currentUser?.permission ?? permission;
    const resolvedCompanyId = currentUser?.companyId ?? companyId;
    const principal = {
      permission: resolvedPermission,
      userScope: resolvedUserScope,
      companyId: resolvedCompanyId,
    } satisfies ServiceDeskSettingsPrincipal;

    return {
      adminType: getServiceDeskAdminType(principal),
      principal,
    };
  }, [
    companyId,
    currentUser?.companyId,
    currentUser?.permission,
    currentUser?.userScope,
    permission,
    userScope,
  ]);

  return (
    <SettingsScopeContext.Provider value={value}>
      {children}
    </SettingsScopeContext.Provider>
  );
}

export function useSettingsScope() {
  const ctx = useContext(SettingsScopeContext);
  if (!ctx) {
    throw new Error(
      "useSettingsScope must be used within SettingsScopeProvider",
    );
  }
  return ctx;
}
