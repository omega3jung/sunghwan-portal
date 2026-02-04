"use client";

import { createContext, useContext } from "react";

import { DataScope, UserScope } from "@/types";

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
  return (
    <SettingsScopeContext.Provider
      value={{
        isDemo: dataScope === "LOCAL",
        isInternal: userScope === "INTERNAL",
        permission,
      }}
    >
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
