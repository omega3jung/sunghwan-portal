import { useEffect, useMemo, useState } from "react";

import { isOwnerCompany } from "@/domain/organization";
import type { CategoryScope } from "@/domain/serviceDesk";
import {
  canManageServiceDeskSettings,
  canReadServiceDeskSettings,
  resolveSettingsAccess,
  type ServiceDeskSettingsResource,
} from "@/lib/application/serviceDesk";

import { useSettingsAccess } from "../../_providers";
import { useTenantSelection } from "../ServiceDeskSettingsTenantSelectionProvider";

const SETTINGS_SCOPES = ["INTERNAL", "PORTAL"] as const satisfies readonly CategoryScope[];

export function useServiceDeskSettingsScopeAccess(
  resource: Exclude<ServiceDeskSettingsResource, "TENANT">,
) {
  const { principal } = useSettingsAccess();
  const { selectedTenant, tenantData } = useTenantSelection();
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
