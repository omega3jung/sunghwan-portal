"use client";

import { createContext, useContext, useMemo } from "react";

import { DataScope, UserScope } from "@/domain/auth";
import { useCurrentSession } from "@/feature/auth/session/client";

type SettingsScopeContextValue = {
  isDemo: boolean;
  isInternal: boolean;
  permission: number;
};

const SettingsScopeContext = createContext<SettingsScopeContextValue | null>(
  null,
);

export function SettingsScopeProvider({
  dataScope,
  userScope,
  permission,
  children,
}: {
  dataScope: DataScope;
  userScope: UserScope;
  permission: number;
  children: React.ReactNode;
}) {
  const { current, data } = useCurrentSession();
  const currentUser = current.user;

  const value = useMemo<SettingsScopeContextValue>(() => {
    const resolvedDataScope = data?.user?.dataScope ?? dataScope;
    const resolvedUserScope = currentUser?.userScope ?? userScope;
    const resolvedPermission = currentUser?.permission ?? permission;

    return {
      isDemo: resolvedDataScope === "LOCAL",
      isInternal: resolvedUserScope === "INTERNAL",
      permission: resolvedPermission,
    };
  }, [
    currentUser?.permission,
    currentUser?.userScope,
    data?.user?.dataScope,
    dataScope,
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
