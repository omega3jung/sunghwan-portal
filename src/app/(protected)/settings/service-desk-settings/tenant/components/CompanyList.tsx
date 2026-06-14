"use client";

import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NS } from "@/lib/i18n";
import { useLocalizedValue } from "@/shared/hooks";
import { cn } from "@/shared/utils/presentation";

import { CompanySettingItem } from "../types";

type CompanyListProps = {
  companies: CompanySettingItem[];
  selectedCompanyIds: string[];
  disabled?: boolean;
  onSelectCompany: (companyId: string) => void;
  className?: string;
};

export function CompanyList({
  companies,
  selectedCompanyIds,
  disabled = false,
  onSelectCompany,
  className,
}: CompanyListProps) {
  const { t } = useTranslation(NS.settings);
  const { t: tServiceDesk } = useTranslation(NS.serviceDesk);
  const tLocal = useLocalizedValue();

  return (
    <FieldGroup className={className}>
      <Field className="gap-0">
        <FieldLabel>
          {t("serviceDeskSettings.tenant.companyList.title")}
        </FieldLabel>
        <FieldDescription>
          {t("serviceDeskSettings.tenant.companyList.description")}
        </FieldDescription>
        <ScrollArea className="h-full w-full md:h-[calc(100vh-var(--settings-offset)-70px)] mt-4 pr-3">
          {companies.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
              {t("serviceDeskSettings.tenant.companyList.empty")}
            </div>
          ) : (
            <div className="flex flex-col gap-2 p-1">
              {companies.map((company) => {
                const companyId = company.id;
                const isSelected = selectedCompanyIds.includes(companyId);

                return (
                  <Button
                    key={companyId}
                    type="button"
                    variant="outline"
                    aria-pressed={isSelected}
                    disabled={disabled}
                    onClick={() => onSelectCompany(companyId)}
                    className={cn(
                      "h-20 w-full flex-col items-stretch gap-2 p-4 border-border text-left",
                      isSelected && "bg-primary/5",
                    )}
                  >
                    <div className="font-medium">{tLocal(company.name)}</div>
                    <div className="font-normal text-sm text-muted-foreground">
                      {company.code ?? tServiceDesk("field.noCode")}
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
