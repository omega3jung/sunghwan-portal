"use client";

import { Loader2, LockKeyhole } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { ServiceDeskSettingsAccess } from "@/lib/application/serviceDesk";
import { NS } from "@/lib/i18n";

type Props = {
  title?: string;
  description?: string;
  isResetDisabled: boolean;
  onReset: () => void;
  isSaveDisabled: boolean;
  onSave: () => void;
  isSaving?: boolean;
};

export function ServiceDeskSettingsPageHeader({
  title,
  description,
  isResetDisabled,
  onReset,
  isSaveDisabled,
  onSave,
  isSaving = false,
}: Props) {
  const { t } = useTranslation(NS.settings);
  const { t: tCommon } = useTranslation(NS.common);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-lg font-semibold">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="flex gap-2 self-start sm:self-auto">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={isResetDisabled}
          onClick={onReset}
        >
          {tCommon("action.reset", { defaultValue: "Reset" })}
        </Button>
        <Button
          type="button"
          size="sm"
          disabled={isSaveDisabled}
          onClick={onSave}
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("serviceDeskSettings.common.saveChanges")}
            </>
          ) : (
            t("serviceDeskSettings.common.saveChanges")
          )}
        </Button>
      </div>
    </div>
  );
}

export function ServiceDeskSettingsAccessBanner({
  access,
  managedBy,
}: {
  access: ServiceDeskSettingsAccess;
  managedBy: "serviceProvider" | "customer";
}) {
  const { t } = useTranslation(NS.settings);

  if (access !== "read") {
    return null;
  }

  return (
    <Alert className="border-amber-500/40 bg-amber-500/5">
      <LockKeyhole className="h-4 w-4" />
      <AlertTitle className="flex flex-wrap gap-1">
        <span>{t("serviceDeskSettings.common.readOnly")}</span>
        <span aria-hidden="true">/</span>
        <span>
          {t(
            managedBy === "serviceProvider"
              ? "serviceDeskSettings.common.managedByServiceProvider"
              : "serviceDeskSettings.common.managedByCustomer",
          )}
        </span>
      </AlertTitle>
      <AlertDescription>
        {t("serviceDeskSettings.common.readOnlyDescription")}
      </AlertDescription>
    </Alert>
  );
}
