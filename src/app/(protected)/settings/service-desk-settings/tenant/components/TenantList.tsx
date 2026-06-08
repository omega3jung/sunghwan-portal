"use client";

import { ChevronLeft, ChevronRight, Info, Lock } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { NS } from "@/lib/i18n";
import { useLocalizedValue } from "@/shared/hooks";
import { cn } from "@/shared/utils/presentation";

import { TenantSettingItem } from "../types";

type TenantListProps = {
  tenants: TenantSettingItem[];
  selectedTenantIds: string[];
  focusedTenantId: string | null;
  selectedCompanyCount: number;
  removableSelectedTenantIds: string[];
  disabled?: boolean;
  onAddTenants: () => void;
  onRemoveTenants: () => void;
  onSelectTenant: (tenant: TenantSettingItem) => void;
};

export function TenantList({
  tenants,
  selectedTenantIds,
  focusedTenantId,
  selectedCompanyCount,
  removableSelectedTenantIds,
  disabled = false,
  onAddTenants,
  onRemoveTenants,
  onSelectTenant,
}: TenantListProps) {
  const { t } = useTranslation(NS.settings);
  const { t: tServiceDesk } = useTranslation(NS.serviceDesk);
  const tLocal = useLocalizedValue();

  return (
    <Card className="min-h-[34rem]">
      <CardHeader className="gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle>
              {t("serviceDeskSettings.tenant.tenantList.title")}
            </CardTitle>
            <HoverCard openDelay={150}>
              <HoverCardTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground"
                  aria-label={t(
                    "serviceDeskSettings.tenant.tenantList.infoAriaLabel",
                  )}
                >
                  <Info className="h-4 w-4" />
                </Button>
              </HoverCardTrigger>
              <HoverCardContent align="start" className="text-sm">
                {t("serviceDeskSettings.tenant.tenantList.portalOwnerHint")}
              </HoverCardContent>
            </HoverCard>
          </div>
          <CardDescription>
            {t("serviceDeskSettings.tenant.tenantList.description")}
          </CardDescription>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={selectedCompanyCount === 0 || disabled}
            onClick={onAddTenants}
          >
            <ChevronRight className="mr-2 h-4 w-4" />
            {t("serviceDeskSettings.tenant.actions.addToTenants")}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={removableSelectedTenantIds.length === 0 || disabled}
            onClick={onRemoveTenants}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            {t("serviceDeskSettings.tenant.actions.moveToCompanies")}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {tenants.length === 0 ? (
          <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
            {t("serviceDeskSettings.tenant.tenantList.empty")}
          </div>
        ) : (
          tenants.map((tenant) => {
            const isSelected = selectedTenantIds.includes(tenant.id);
            const isFocused = focusedTenantId === tenant.id;
            const isPortalOwner = Boolean(tenant.isPortalOwner);

            return (
              <button
                key={tenant.id}
                type="button"
                aria-pressed={isSelected}
                disabled={disabled}
                onClick={() => onSelectTenant(tenant)}
                className={cn(
                  "flex w-full flex-col gap-3 rounded-lg border p-4 text-left transition-colors",
                  "hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  "disabled:pointer-events-none disabled:opacity-50",
                  isSelected && "bg-primary/5",
                  isFocused && "border-primary ring-1 ring-primary",
                  isPortalOwner && "border-dashed bg-muted/20",
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="font-medium">{tLocal(tenant.name)}</div>
                  {tenant.isPortalOwner && (
                    <Badge variant="secondary">
                      <Lock className="mr-1 h-3 w-3" />
                      {tServiceDesk("tenant.portalOwner")}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm text-muted-foreground">
                    {tenant.code ?? tServiceDesk("field.noCode")}
                  </div>
                  <span
                    className="h-4 w-4 rounded-full border"
                    style={{ backgroundColor: tenant.color }}
                    title={tenant.color}
                  />
                </div>
              </button>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
