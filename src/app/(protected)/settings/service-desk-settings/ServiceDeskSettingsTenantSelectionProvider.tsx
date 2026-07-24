"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { type Tenant } from "@/domain/serviceDesk";
import { useServiceDeskTenantListQuery } from "@/feature/serviceDesk/tenant/client";
import type { ServiceDeskTenantListParams } from "@/feature/serviceDesk/tenant/types";

import { useSettingsAccess } from "../_providers";

type TenantSelectionContextValue = {
  tenantData: Tenant[];
  selectedTenant: string | null;
  setSelectedTenant: React.Dispatch<React.SetStateAction<string | null>>;
  isTenantSelectionLoading: boolean;
  currentCompanyId: string | null;
};

const EMPTY_TENANTS: Tenant[] = [];
const TenantSelectionContext =
  createContext<TenantSelectionContextValue | null>(null);

export function ServiceDeskSettingsTenantSelectionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { principal, type } = useSettingsAccess();
  const currentCompanyId = String(principal.companyId);
  const selectionIdentityKey = `${type ?? "NONE"}:${currentCompanyId}`;
  const previousIdentityKeyRef = useRef<string | null>(null);
  const [selectedTenant, setSelectedTenant] = useState<string | null>(null);
  const tenantParams = useMemo(
    () =>
      ({
        active: true,
        settings: true,
        context: "settings",
        settingsPrincipalKey: selectionIdentityKey,
      }) satisfies ServiceDeskTenantListParams,
    [selectionIdentityKey],
  );

  const { data: tenantData = EMPTY_TENANTS, isLoading: isTenantsLoading } =
    useServiceDeskTenantListQuery(tenantParams);

  useEffect(() => {
    if (!tenantData.length) {
      setSelectedTenant(null);
      return;
    }

    const currentCompanyTenant = currentCompanyId
      ? tenantData.find(
          (tenant) => tenant.companyId === currentCompanyId,
        )
      : undefined;
    const firstTenant = tenantData[0]?.id ?? null;
    const preferredTenant =
      currentCompanyTenant?.id ??
      (type === "OWNER_ADMIN" ? firstTenant : null);
    const identityChanged =
      previousIdentityKeyRef.current !== selectionIdentityKey;
    previousIdentityKeyRef.current = selectionIdentityKey;

    setSelectedTenant((previousSelectedTenant) => {
      if (type === "TENANT_ADMIN" || identityChanged) {
        return preferredTenant;
      }

      if (
        previousSelectedTenant &&
        tenantData.some((tenant) => tenant.id === previousSelectedTenant)
      ) {
        return previousSelectedTenant;
      }

      return preferredTenant;
    });
  }, [currentCompanyId, selectionIdentityKey, tenantData, type]);

  const value = useMemo<TenantSelectionContextValue>(
    () => ({
      tenantData,
      selectedTenant,
      setSelectedTenant,
      isTenantSelectionLoading: isTenantsLoading,
      currentCompanyId,
    }),
    [
      currentCompanyId,
      isTenantsLoading,
      selectedTenant,
      tenantData,
    ],
  );

  return (
    <TenantSelectionContext.Provider value={value}>
      {children}
    </TenantSelectionContext.Provider>
  );
}

export function useTenantSelection() {
  const context = useContext(TenantSelectionContext);

  if (!context) {
    throw new Error(
      "useTenantSelection must be used within ServiceDeskSettingsTenantSelectionProvider",
    );
  }

  return context;
}
