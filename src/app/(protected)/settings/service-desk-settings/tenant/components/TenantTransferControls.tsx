"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { NS } from "@/lib/application/i18n";
import { cn } from "@/shared/utils/presentation";

type TenantTransferControlsProps = {
  canAddTenants: boolean;
  canRemoveTenants: boolean;
  disabled?: boolean;
  onAddTenants: () => void;
  onRemoveTenants: () => void;
  className?: string;
};

export function TenantTransferControls({
  canAddTenants,
  canRemoveTenants,
  disabled = false,
  onAddTenants,
  onRemoveTenants,
  className,
}: TenantTransferControlsProps) {
  const { t } = useTranslation(NS.settings);

  return (
    <div
      className={cn("flex items-center justify-center lg:h-full", className)}
    >
      <div className="flex flex-row gap-2 lg:flex-col">
        <Button
          type="button"
          size="icon_sm"
          title={t("serviceDeskSettings.tenant.actions.addToTenants")}
          aria-label={t("serviceDeskSettings.tenant.actions.addToTenants")}
          disabled={!canAddTenants || disabled}
          onClick={onAddTenants}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="icon_sm"
          title={t("serviceDeskSettings.tenant.actions.moveToCompanies")}
          aria-label={t("serviceDeskSettings.tenant.actions.moveToCompanies")}
          disabled={!canRemoveTenants || disabled}
          onClick={onRemoveTenants}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
