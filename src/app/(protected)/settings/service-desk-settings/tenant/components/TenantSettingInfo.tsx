"use client";

import { useTranslation } from "react-i18next";

import { ColorPicker } from "@/components/custom/ColorPicker";
import { Badge } from "@/components/ui/badge";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NS } from "@/lib/application/i18n";
import { getLanguageOptions } from "@/lib/client/i18n";
import { Locale } from "@/shared/types";
import { cn } from "@/shared/utils/presentation";

import { DEFAULT_TENANT_COLOR } from "../constants";
import { TenantSettingItem } from "../types";

type TenantSettingInfoProps = {
  tenant: TenantSettingItem | null;
  disabled?: boolean;
  onTenantNameChange: (tenantId: string, locale: Locale, value: string) => void;
  onTenantColorChange: (tenantId: string, color: string) => void;
  className?: string;
};

export function TenantSettingInfo({
  tenant,
  disabled = false,
  onTenantNameChange,
  onTenantColorChange,
  className,
}: TenantSettingInfoProps) {
  const { t } = useTranslation(NS.settings);
  const { t: tServiceDesk } = useTranslation(NS.serviceDesk);
  const { t: tCommon } = useTranslation(NS.common);
  const localLocales = getLanguageOptions(t);

  return (
    <FieldGroup className={cn("gap-4 pl-6 border-l", className)}>
      <Field className="gap-0">
        <FieldLabel>
          {t("serviceDeskSettings.tenant.settingInfo.title")}
        </FieldLabel>
        <FieldDescription>
          {t("serviceDeskSettings.tenant.settingInfo.description")}
        </FieldDescription>
      </Field>
      {!tenant && (
        <div className="h-20 rounded-lg border border-dashed m-1 p-7 text-sm text-muted-foreground">
          {t("serviceDeskSettings.tenant.settingInfo.empty")}
        </div>
      )}

      {tenant && (
        <FieldGroup className="pt-2">
          <FieldSet>
            <div className="flex flex-wrap items-center gap-2 pb-2">
              <Badge variant="outline">
                {tenant.code ?? tServiceDesk("field.noCode")}
              </Badge>
              {tenant.isPortalOwner && (
                <Badge variant="secondary">
                  {tServiceDesk("tenant.portalOwner")}
                </Badge>
              )}
              {tenant.active && (
                <Badge variant="outline">{tServiceDesk("status.active")}</Badge>
              )}
            </div>

            <FieldGroup>
              <Field>
                <FieldLabel>
                  {t("serviceDeskSettings.tenant.settingInfo.nameTitle")}
                </FieldLabel>
                <FieldDescription>
                  {t("serviceDeskSettings.tenant.settingInfo.nameDescription")}
                </FieldDescription>
              </Field>

              {localLocales.map((locale) => {
                const inputId = `tenant-name-${locale.value}`;

                return (
                  <Field key={locale.value}>
                    <FieldLabel htmlFor={inputId}>{locale.label}</FieldLabel>
                    <Input
                      id={inputId}
                      disabled={disabled}
                      value={tenant.name[locale.value]}
                      onChange={(event) =>
                        onTenantNameChange(
                          tenant.id,
                          locale.value,
                          event.target.value,
                        )
                      }
                      placeholder={t(
                        "serviceDeskSettings.tenant.settingInfo.tenantNamePlaceholder",
                        {
                          language: locale.label,
                        },
                      )}
                    />
                  </Field>
                );
              })}

              <Field>
                <FieldLabel>
                  {t("serviceDeskSettings.tenant.settingInfo.colorTitle")}
                </FieldLabel>
                <ColorPicker
                  value={tenant.color}
                  onChange={(color) => onTenantColorChange(tenant.id, color)}
                  defaultValue={DEFAULT_TENANT_COLOR}
                  disabled={disabled}
                >
                  <ColorPicker.Trigger />
                  <ColorPicker.HexInput />
                  <ColorPicker.Reset>{tCommon("reset")}</ColorPicker.Reset>
                </ColorPicker>
              </Field>
            </FieldGroup>
          </FieldSet>
        </FieldGroup>
      )}
    </FieldGroup>
  );
}
