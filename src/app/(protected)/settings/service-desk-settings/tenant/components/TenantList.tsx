"use client";

import { Info, Lock } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLocalizedValue } from "@/lib/client/i18n";
import { NS } from "@/lib/i18n";
import { cn } from "@/shared/utils/presentation";

import { TenantSettingItem } from "../types";

type TenantListProps = {
  tenants: TenantSettingItem[];
  selectedTenantIds: string[];
  focusedTenantId: string | null;
  disabled?: boolean;
  onSelectTenant: (tenant: TenantSettingItem) => void;
  className?: string;
};

export function TenantList({
  tenants,
  selectedTenantIds,
  focusedTenantId,
  disabled = false,
  onSelectTenant,
  className,
}: TenantListProps) {
  const { t } = useTranslation(NS.settings);
  const { t: tServiceDesk } = useTranslation(NS.serviceDesk);
  const tLocal = useLocalizedValue();

  return (
    <FieldGroup className={className}>
      <Field className="gap-0">
        <FieldLabel>
          {t("serviceDeskSettings.tenant.tenantList.title")}
          <HoverCard openDelay={150}>
            <HoverCardTrigger asChild>
              <Info className="h-4 w-4" />
            </HoverCardTrigger>
            <HoverCardContent align="start" className="text-sm">
              {t("serviceDeskSettings.tenant.tenantList.portalOwnerHint")}
            </HoverCardContent>
          </HoverCard>
        </FieldLabel>
        <FieldDescription>
          {t("serviceDeskSettings.tenant.tenantList.description")}
        </FieldDescription>
        <ScrollArea className="mt-4 h-full w-full md:h-[calc(100vh-var(--settings-offset)-70px)]">
          {tenants.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
              {t("serviceDeskSettings.tenant.tenantList.empty")}
            </div>
          ) : (
            <div className="flex flex-col gap-2 p-1">
              {tenants.map((tenant) => {
                const isSelected = selectedTenantIds.includes(tenant.id);
                const isFocused = focusedTenantId === tenant.id;
                const isPortalOwner = Boolean(tenant.isPortalOwner);

                return (
                  <Button
                    key={tenant.id}
                    type="button"
                    variant="outline"
                    aria-pressed={isSelected}
                    disabled={disabled}
                    onClick={() => onSelectTenant(tenant)}
                    className={cn(
                      "h-20 w-full flex-col items-stretch gap-2 border-border p-4 text-left ",
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
                      <div className="font-normal text-sm text-muted-foreground">
                        {tenant.code ?? tServiceDesk("field.noCode")}
                      </div>
                      <span
                        className="h-4 w-4 rounded-full border"
                        style={{ backgroundColor: tenant.color }}
                        title={tenant.color}
                      />
                    </div>
                  </Button>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </Field>
    </FieldGroup>
  );
}
