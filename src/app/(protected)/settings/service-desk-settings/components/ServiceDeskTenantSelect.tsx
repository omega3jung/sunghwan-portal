"use client";

import { useTranslation } from "react-i18next";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CategoryScope } from "@/domain/serviceDesk";
import { useLocalizedValue } from "@/lib/client/i18n";
import { NS } from "@/lib/i18n";
import { cn } from "@/shared/utils/presentation";

import { useSettingsScope } from "../../_providers";
import { useServiceDeskSettingsTenant } from "../ServiceDeskSettingsTenantProvider";

export function ServiceDeskTenantSelect({
  className,
}: {
  className?: string;
}) {
  const { adminType } = useSettingsScope();
  const { t } = useTranslation(NS.settings);
  const tLocal = useLocalizedValue();
  const { tenantData, selectedTenant, setSelectedTenant } =
    useServiceDeskSettingsTenant();

  if (adminType !== "OWNER_ADMIN") {
    return null;
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <span>{t("serviceDeskSettings.common.tenant")}</span>
      <Select value={selectedTenant ?? ""} onValueChange={setSelectedTenant}>
        <SelectTrigger>
          <SelectValue placeholder={t("serviceDeskSettings.common.tenant")} />
        </SelectTrigger>
        <SelectContent>
          {tenantData.map((tenant) => (
            <SelectItem key={`select_item_${tenant.id}`} value={tenant.id}>
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: tenant.color }}
                  title={tenant.color}
                ></span>
                {tLocal(tenant.name)}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function ServiceDeskSettingsScopeSelect({
  value,
  onValueChange,
  availableScopes,
  disabled = false,
  className,
}: {
  value: CategoryScope;
  onValueChange: (scope: CategoryScope) => void;
  availableScopes: readonly CategoryScope[];
  disabled?: boolean;
  className?: string;
}) {
  const { t } = useTranslation(NS.settings);

  return (
    <div className={cn("flex min-w-44 flex-col gap-2", className)}>
      <span>{t("serviceDeskSettings.common.scope")}</span>
      <Select
        value={value}
        onValueChange={(scope) => onValueChange(scope as CategoryScope)}
        disabled={disabled || availableScopes.length === 0}
      >
        <SelectTrigger>
          <SelectValue placeholder={t("serviceDeskSettings.common.scope")} />
        </SelectTrigger>
        <SelectContent>
          {availableScopes.map((scope) => (
            <SelectItem key={scope} value={scope}>
              {t(
                `serviceDeskSettings.common.scope${
                  scope === "INTERNAL" ? "Internal" : "Portal"
                }`,
              )}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
