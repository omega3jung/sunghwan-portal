"use client";

import { useState } from "react";

import { useCurrentPreference } from "@/feature/user/preference/client";
import type { ServiceDeskSettingsResource } from "@/lib/application/serviceDesk";
import type { Locale } from "@/shared/types";

import { useTenantSelection } from "../ServiceDeskSettingsTenantSelectionProvider";
import { useServiceDeskSettingsScopeAccess } from "./useServiceDeskSettingsScopeAccess";

export function useServiceDeskSettingsPageContext(
  resource: Exclude<ServiceDeskSettingsResource, "TENANT">,
) {
  const { selectedTenant, isTenantSelectionLoading } = useTenantSelection();
  const scopeAccess = useServiceDeskSettingsScopeAccess(resource);
  const { current: userPreference } = useCurrentPreference();
  const [language, setLanguage] = useState<Locale>(userPreference.language);

  return {
    ...scopeAccess,
    selectedTenant,
    isTenantSelectionLoading,
    language,
    setLanguage,
  };
}

export type ServiceDeskSettingsPageContext = ReturnType<
  typeof useServiceDeskSettingsPageContext
>;
