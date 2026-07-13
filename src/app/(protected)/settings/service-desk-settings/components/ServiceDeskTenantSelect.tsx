"use client";

import { useTranslation } from "react-i18next";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NS } from "@/lib/i18n";
import { useLocalizedValue } from "@/shared/hooks";
import { cn } from "@/shared/utils/presentation";

import { useSettingsScope } from "../../_providers";
import { useServiceDeskSettingsTenant } from "../ServiceDeskSettingsTenantProvider";

export function ServiceDeskTenantSelect({
  className,
}: {
  className?: string;
}) {
  const { isInternal } = useSettingsScope();
  const { t } = useTranslation(NS.settings);
  const tLocal = useLocalizedValue();
  const { tenantData, selectedTenant, setSelectedTenant } =
    useServiceDeskSettingsTenant();

  if (!isInternal) {
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
