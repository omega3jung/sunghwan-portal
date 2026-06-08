"use client";

import { useTranslation } from "react-i18next";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { NS } from "@/lib/i18n";
import { useLocalizedValue } from "@/shared/hooks";
import { cn } from "@/shared/utils/presentation";

import { CompanySettingItem } from "../types";

type CompanyListProps = {
  companies: CompanySettingItem[];
  selectedCompanyIds: string[];
  disabled?: boolean;
  onSelectCompany: (companyId: string) => void;
};

export function CompanyList({
  companies,
  selectedCompanyIds,
  disabled = false,
  onSelectCompany,
}: CompanyListProps) {
  const { t } = useTranslation(NS.settings);
  const { t: tServiceDesk } = useTranslation(NS.serviceDesk);
  const tLocal = useLocalizedValue();

  return (
    <Card className="min-h-[34rem]">
      <CardHeader>
        <CardTitle>
          {t("serviceDeskSettings.tenant.companyList.title")}
        </CardTitle>
        <CardDescription>
          {t("serviceDeskSettings.tenant.companyList.description")}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {companies.length === 0 ? (
          <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
            {t("serviceDeskSettings.tenant.companyList.empty")}
          </div>
        ) : (
          companies.map((company) => {
            const companyId = company.id;
            const isSelected = selectedCompanyIds.includes(companyId);

            return (
              <button
                key={companyId}
                type="button"
                aria-pressed={isSelected}
                disabled={disabled}
                onClick={() => onSelectCompany(companyId)}
                className={cn(
                  "flex w-full flex-col gap-3 rounded-lg border p-4 text-left transition-colors",
                  "hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  "disabled:pointer-events-none disabled:opacity-50",
                  isSelected &&
                    "border-primary bg-primary/5 ring-1 ring-primary",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="font-medium">{tLocal(company.name)}</div>
                    <div className="text-sm text-muted-foreground">
                      {company.code ?? tServiceDesk("field.noCode")}
                    </div>
                  </div>
                  <div className="flex flex-wrap justify-end gap-2">
                    {company.isPortalOwner && (
                      <Badge variant="secondary">
                        {tServiceDesk("tenant.portalOwner")}
                      </Badge>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
