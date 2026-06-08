"use client";

import { useTranslation } from "react-i18next";

import { ColorPicker } from "@/components/custom/ColorPicker";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NS } from "@/lib/i18n";

import { DEFAULT_TENANT_COLOR, TENANT_LOCALES } from "../constants";
import { TenantLocaleKey, TenantSettingItem } from "../types";

type TenantSettingInfoProps = {
  tenant: TenantSettingItem | null;
  disabled?: boolean;
  onTenantNameChange: (
    tenantId: string,
    locale: TenantLocaleKey,
    value: string,
  ) => void;
  onTenantColorChange: (tenantId: string, color: string) => void;
};

export function TenantSettingInfo({
  tenant,
  disabled = false,
  onTenantNameChange,
  onTenantColorChange,
}: TenantSettingInfoProps) {
  const { t } = useTranslation(NS.settings);
  const { t: tServiceDesk } = useTranslation(NS.serviceDesk);
  const { t: tCommon } = useTranslation(NS.common);

  return (
    <Card className="min-h-[34rem]">
      <CardHeader>
        <CardTitle>{t("serviceDeskSettings.tenant.settingInfo.title")}</CardTitle>
        <CardDescription>
          {t("serviceDeskSettings.tenant.settingInfo.description")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!tenant && (
          <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
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

                {TENANT_LOCALES.map((locale) => {
                  const inputId = `tenant-name-${locale.key}`;
                  const languageLabel = t(locale.labelKey);

                  return (
                    <Field key={locale.key}>
                      <FieldLabel htmlFor={inputId}>{languageLabel}</FieldLabel>
                      <Input
                        id={inputId}
                        disabled={disabled}
                        value={tenant.name[locale.key]}
                        onChange={(event) =>
                          onTenantNameChange(
                            tenant.id,
                            locale.key,
                            event.target.value,
                          )
                        }
                        placeholder={t(
                          "serviceDeskSettings.tenant.field.tenantNamePlaceholder",
                          {
                            language: languageLabel,
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
      </CardContent>
    </Card>
  );
}
