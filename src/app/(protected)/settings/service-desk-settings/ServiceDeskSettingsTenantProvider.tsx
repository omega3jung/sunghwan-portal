"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

import type { Tenant } from "@/domain/serviceDesk";
import { useCurrentSession } from "@/feature/auth/session/client";
import { useServiceDeskTenantListQuery } from "@/feature/serviceDesk/tenant/client";
import type { ServiceDeskTenantListParams } from "@/feature/serviceDesk/tenant/types";

import { useSettingsScope } from "../_providers";

type ServiceDeskSettingsTenantContextValue = {
  tenantData: Tenant[];
  selectedTenant: string | null;
  setSelectedTenant: React.Dispatch<React.SetStateAction<string | null>>;
  isTenantSelectionLoading: boolean;
  currentCompanyId: string | null;
};

type CompanyScopedUser =
  | {
      companyId?: number | string | null;
    }
  | null
  | undefined;

type CompanyScopedSession =
  | {
      user?: CompanyScopedUser;
    }
  | null
  | undefined;

const ACTIVE_TENANT_PARAMS = {
  active: true,
} satisfies ServiceDeskTenantListParams;

const EMPTY_TENANTS: Tenant[] = [];

const ServiceDeskSettingsTenantContext =
  createContext<ServiceDeskSettingsTenantContextValue | null>(null);

export function ServiceDeskSettingsTenantProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isInternal } = useSettingsScope();
  const { current: currentSession, data: authSession } = useCurrentSession();
  const currentCompanyId = resolveCurrentCompanyId(
    authSession,
    currentSession.user,
  );
  const [selectedTenant, setSelectedTenant] = useState<string | null>(null);

  const { data: tenantData = EMPTY_TENANTS, isLoading: isTenantsLoading } =
    useServiceDeskTenantListQuery(ACTIVE_TENANT_PARAMS);

  useEffect(() => {
    if (!tenantData.length) {
      setSelectedTenant(null);
      return;
    }

    const currentCompanyTenant = currentCompanyId
      ? tenantData.find(
          (tenant) =>
            tenant.id === currentCompanyId ||
            tenant.companyId === currentCompanyId,
        )
      : undefined;
    const firstTenant = tenantData[0]?.id ?? null;
    const preferredTenant = isInternal
      ? firstTenant
      : (currentCompanyTenant?.id ?? firstTenant);

    setSelectedTenant((previousSelectedTenant) => {
      if (!isInternal && currentCompanyTenant) {
        return currentCompanyTenant.id;
      }

      if (
        previousSelectedTenant &&
        tenantData.some((tenant) => tenant.id === previousSelectedTenant)
      ) {
        return previousSelectedTenant;
      }

      return preferredTenant;
    });
  }, [currentCompanyId, isInternal, tenantData]);

  const value = useMemo<ServiceDeskSettingsTenantContextValue>(
    () => ({
      tenantData,
      selectedTenant,
      setSelectedTenant,
      isTenantSelectionLoading:
        isTenantsLoading || (!isInternal && !currentCompanyId),
      currentCompanyId,
    }),
    [
      currentCompanyId,
      isInternal,
      isTenantsLoading,
      selectedTenant,
      tenantData,
    ],
  );

  return (
    <ServiceDeskSettingsTenantContext.Provider value={value}>
      {children}
    </ServiceDeskSettingsTenantContext.Provider>
  );
}

export function useServiceDeskSettingsTenant() {
  const context = useContext(ServiceDeskSettingsTenantContext);

  if (!context) {
    throw new Error(
      "useServiceDeskSettingsTenant must be used within ServiceDeskSettingsTenantProvider",
    );
  }

  return context;
}

function resolveCurrentCompanyId(
  authSession: CompanyScopedSession,
  currentUser: CompanyScopedUser,
) {
  const companyId = authSession?.user?.companyId ?? currentUser?.companyId;

  if (companyId === null || companyId === undefined) {
    return null;
  }

  return String(companyId);
}
