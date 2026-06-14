"use client";

import { Loader2 } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { useCurrentSession } from "@/feature/auth/session/client";
import { useCompanyListQuery } from "@/feature/organization/company/client";
import { useServiceDeskTenantListQuery } from "@/feature/serviceDesk/tenant/client";
import { NS } from "@/lib/i18n";
import { DbParams } from "@/shared/types";

import { ServiceDeskSettingsPageHeader } from "../components/ServiceDeskSettingsPageHeader";
import { CompanyList } from "./components/CompanyList";
import { TenantList } from "./components/TenantList";
import { TenantSettingInfo } from "./components/TenantSettingInfo";
import { TenantTransferControls } from "./components/TenantTransferControls";
import { useTenantSettings } from "./hooks/useTenantSettings";

export default function TenantPage() {
  const { t } = useTranslation(NS.settings);
  const { t: tCommon } = useTranslation(NS.common);
  const { status: sessionStatus } = useCurrentSession();
  const params = useMemo<DbParams>(() => ({}), []);
  const companyQuery = useCompanyListQuery(params);
  const tenantQuery = useServiceDeskTenantListQuery(params);
  const tenantSettings = useTenantSettings({
    companies: companyQuery.data ?? [],
    sourceTenants: tenantQuery.data ?? [],
  });
  const hasError = Boolean(companyQuery.error || tenantQuery.error);
  const isLoading =
    !hasError &&
    (sessionStatus === "loading" ||
      companyQuery.isLoading ||
      tenantQuery.isLoading ||
      companyQuery.data === undefined ||
      tenantQuery.data === undefined);

  if (isLoading) {
    return (
      <div className="flex h-40 w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex h-40 w-full flex-col items-center justify-center gap-3 text-center">
        <p className="text-sm text-muted-foreground">
          Failed to load tenant settings.
        </p>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => {
            void companyQuery.refetch();
            void tenantQuery.refetch();
          }}
        >
          {tCommon("action.retry", { defaultValue: "Retry" })}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-2">
      <ServiceDeskSettingsPageHeader
        title={t("serviceDeskSettings.common.tenant")}
        description={t(
          "settingsNavigation.serviceDeskSettings.tenant.description",
        )}
        isResetDisabled={
          !tenantSettings.pageHeader.canReset ||
          tenantSettings.pageHeader.isSaving
        }
        onReset={tenantSettings.pageHeader.onReset}
        isSaveDisabled={!tenantSettings.pageHeader.canSave}
        onSave={() => void tenantSettings.pageHeader.onSave()}
        isSaving={tenantSettings.pageHeader.isSaving}
      />

      <div
        className="grid grid-cols-1 gap-y-6 pt-4 lg:grid-cols-[minmax(0,_30%)_28px_1.5rem_minmax(0,_30%)_1.5rem_minmax(0,_1fr)] lg:gap-x-0"
        style={{ "--settings-offset": "18rem" } as React.CSSProperties}
      >
        <CompanyList
          className="lg:col-start-1"
          {...tenantSettings.companyList}
        />

        <TenantTransferControls
          className="lg:col-start-2 pl-3"
          {...tenantSettings.transferControls}
        />

        <TenantList className="lg:col-start-4" {...tenantSettings.tenantList} />

        <TenantSettingInfo
          className="lg:col-start-6"
          {...tenantSettings.settingInfo}
        />
      </div>
    </div>
  );
}
