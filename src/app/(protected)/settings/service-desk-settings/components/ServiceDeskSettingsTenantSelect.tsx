"use client";

import { useTranslation } from "react-i18next";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NS } from "@/lib/application/i18n";
import { useLocalizedValue } from "@/lib/client/i18n";

import { useSettingsAccess } from "../../_providers";
import { useTenantSelection } from "../ServiceDeskSettingsTenantSelectionProvider";

export function ServiceDeskSettingsTenantSelect({
  onBeforeTenantChange,
}: {
  onBeforeTenantChange?: () => boolean;
}) {
  const { type } = useSettingsAccess();
  const { t } = useTranslation(NS.settings);
  const getLocalizedValue = useLocalizedValue();
  const { tenantData, selectedTenant, setSelectedTenant } =
    useTenantSelection();

  if (type !== "OWNER_ADMIN") {
    return null;
  }

  const tenantOptions = tenantData.map((tenant) => ({
    value: tenant.id,
    label: getLocalizedValue(tenant.name),
    color: tenant.color,
  }));
  const selectedTenantOption = tenantOptions.find(
    (tenant) => tenant.value === selectedTenant,
  );

  return (
    <Select
      items={tenantOptions}
      value={selectedTenant ?? ""}
      onValueChange={(tenantId) => {
        if (
          tenantId === selectedTenant ||
          onBeforeTenantChange?.() !== false
        ) {
          setSelectedTenant(tenantId);
        }
      }}
    >
      <SelectTrigger className="min-w-36 shadow-sm">
        {selectedTenantOption && (
          <span
            className="size-3 shrink-0 rounded-full"
            style={{ backgroundColor: selectedTenantOption.color }}
            title={selectedTenantOption.color}
          />
        )}
        <SelectValue placeholder={t("serviceDeskSettings.common.tenant")} />
      </SelectTrigger>
      <SelectContent className="w-full">
        {tenantOptions.map((tenant) => (
          <SelectItem key={`select_item_${tenant.value}`} value={tenant.value}>
            <div className="flex items-center gap-2">
              <span
                className="size-3 rounded-full"
                style={{ backgroundColor: tenant.color }}
                title={tenant.color}
              />
              {tenant.label}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
