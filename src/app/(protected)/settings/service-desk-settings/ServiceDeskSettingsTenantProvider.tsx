"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { isOwnerCompany } from "@/domain/organization";
import {
  type CategoryScope,
  type Tenant,
} from "@/domain/serviceDesk";
import { useServiceDeskTenantListQuery } from "@/feature/serviceDesk/tenant/client";
import type { ServiceDeskTenantListParams } from "@/feature/serviceDesk/tenant/types";
import {
  canManageServiceDeskSettings,
  canReadServiceDeskSettings,
  resolveSettingsAccess,
  type ServiceDeskSettingsResource,
} from "@/lib/application/serviceDesk";

import { useSettingsScope } from "../_providers";

type ServiceDeskSettingsTenantContextValue = {
  tenantData: Tenant[];
  selectedTenant: string | null;
  setSelectedTenant: React.Dispatch<React.SetStateAction<string | null>>;
  isTenantSelectionLoading: boolean;
  currentCompanyId: string | null;
};

const EMPTY_TENANTS: Tenant[] = [];
const SETTINGS_SCOPES = ["INTERNAL", "PORTAL"] as const satisfies readonly CategoryScope[];

const ServiceDeskSettingsTenantContext =
  createContext<ServiceDeskSettingsTenantContextValue | null>(null);

export function ServiceDeskSettingsTenantProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { adminType, principal } = useSettingsScope();
  const currentCompanyId = String(principal.companyId);
  const selectionIdentityKey = `${adminType ?? "NONE"}:${currentCompanyId}`;
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
      (adminType === "OWNER_ADMIN" ? firstTenant : null);
    const identityChanged =
      previousIdentityKeyRef.current !== selectionIdentityKey;
    previousIdentityKeyRef.current = selectionIdentityKey;

    setSelectedTenant((previousSelectedTenant) => {
      if (adminType === "TENANT_ADMIN" || identityChanged) {
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
  }, [adminType, currentCompanyId, selectionIdentityKey, tenantData]);

  const value = useMemo<ServiceDeskSettingsTenantContextValue>(
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

export function useServiceDeskSettingsScopeAccess(
  resource: Exclude<ServiceDeskSettingsResource, "TENANT">,
) {
  const { principal } = useSettingsScope();
  const { selectedTenant, tenantData } = useServiceDeskSettingsTenant();
  const [requestedScope, setRequestedScope] =
    useState<CategoryScope>("INTERNAL");

  const selectedTenantData = useMemo(
    () => tenantData.find((tenant) => tenant.id === selectedTenant) ?? null,
    [selectedTenant, tenantData],
  );
  const isOwnerTenant =
    selectedTenantData !== null && isOwnerCompany(selectedTenantData.companyId);

  const accessByScope = useMemo(
    () =>
      Object.fromEntries(
        SETTINGS_SCOPES.map((scope) => [
          scope,
          resolveSettingsAccess(principal, {
            resource,
            tenantCompanyId: selectedTenantData?.companyId,
            isOwnerTenant: selectedTenantData ? isOwnerTenant : undefined,
            scope,
          }),
        ]),
      ) as Record<CategoryScope, ReturnType<typeof resolveSettingsAccess>>,
    [isOwnerTenant, principal, resource, selectedTenantData],
  );
  const availableScopes = useMemo(
    () =>
      SETTINGS_SCOPES.filter((scope) =>
        canReadServiceDeskSettings(accessByScope[scope]),
      ),
    [accessByScope],
  );
  const selectedScope = availableScopes.includes(requestedScope)
    ? requestedScope
    : (availableScopes[0] ?? requestedScope);
  const access = accessByScope[selectedScope];

  useEffect(() => {
    if (availableScopes.length && requestedScope !== selectedScope) {
      setRequestedScope(selectedScope);
    }
  }, [availableScopes.length, requestedScope, selectedScope]);

  return {
    selectedScope,
    setSelectedScope: setRequestedScope,
    availableScopes,
    access,
    canRead: canReadServiceDeskSettings(access),
    canManage: canManageServiceDeskSettings(access),
    selectedTenantData,
    isOwnerTenant,
    contextKey: selectedTenant ? `${selectedTenant}:${selectedScope}` : null,
  };
}
