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

import { CompanyList } from "./components/CompanyList";
import { TenantList } from "./components/TenantList";
import { TenantSettingInfo } from "./components/TenantSettingInfo";
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold">
            {t("serviceDeskSettings.general.tenant")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("serviceDeskSettings.tenant.description")}
          </p>
        </div>

        <div className="flex gap-2 self-start sm:self-auto">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={!tenantSettings.canReset || tenantSettings.isSaving}
            onClick={tenantSettings.handleReset}
          >
            {tCommon("action.reset", { defaultValue: "Reset" })}
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={!tenantSettings.canSave}
            onClick={() => void tenantSettings.handleSave()}
          >
            {tenantSettings.isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("serviceDeskSettings.general.saveChanges")}
              </>
            ) : (
              t("serviceDeskSettings.general.saveChanges")
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <CompanyList
          companies={tenantSettings.availableCompanies}
          selectedCompanyIds={tenantSettings.selectedCompanyIds}
          disabled={tenantSettings.isSaving}
          onSelectCompany={tenantSettings.handleCompanySelect}
        />

        <TenantList
          tenants={tenantSettings.tenants}
          selectedTenantIds={tenantSettings.selectedTenantIds}
          focusedTenantId={tenantSettings.focusedTenantId}
          selectedCompanyCount={tenantSettings.selectedCompanyIds.length}
          removableSelectedTenantIds={
            tenantSettings.removableSelectedTenantIds
          }
          disabled={tenantSettings.isSaving}
          onAddTenants={tenantSettings.handleAddTenants}
          onRemoveTenants={tenantSettings.handleRemoveTenants}
          onSelectTenant={tenantSettings.handleTenantSelect}
        />

        <TenantSettingInfo
          tenant={tenantSettings.focusedTenant}
          disabled={tenantSettings.isSaving}
          onTenantNameChange={tenantSettings.handleTenantNameChange}
          onTenantColorChange={tenantSettings.handleTenantColorChange}
        />
      </div>
    </div>
  );
}
