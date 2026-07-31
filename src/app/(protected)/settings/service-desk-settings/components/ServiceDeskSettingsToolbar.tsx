"use client";

import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CategoryScope } from "@/domain/serviceDesk";
import { NS } from "@/lib/application/i18n";
import { getLanguageOptions } from "@/lib/client/i18n";
import type { Locale } from "@/shared/types";

import { ServiceDeskSettingsTenantSelect } from "./ServiceDeskSettingsTenantSelect";

export type ServiceDeskSettingsToolbarModel = {
  onBeforeTenantChange?: () => boolean;
  scope: {
    value: CategoryScope;
    onValueChange: (scope: CategoryScope) => void;
    availableScopes: readonly CategoryScope[];
    disabled?: boolean;
  };
  language: {
    value: Locale;
    onValueChange: (language: Locale) => void;
  };
};

export function ServiceDeskSettingsToolbar({
  controls,
  action,
}: {
  controls: ServiceDeskSettingsToolbarModel;
  action?: React.ReactNode;
}) {
  const { t } = useTranslation(NS.settings);

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-2">
      <span className="shrink-0 text-base">
        {t("serviceDeskSettings.common.categoryList")}
      </span>
      <ServiceDeskSettingsTenantSelect
        onBeforeTenantChange={controls.onBeforeTenantChange}
      />
      <ScopeSelect {...controls.scope} />
      <LanguageSelect
        language={controls.language.value}
        onLanguageChange={controls.language.onValueChange}
      />
      {action && <div className="ml-auto shrink-0">{action}</div>}
    </div>
  );
}

export function ScopeSelect({
  value,
  onValueChange,
  availableScopes,
  disabled = false,
  placeholder,
}: {
  value: CategoryScope | null;
  onValueChange: (scope: CategoryScope) => void;
  availableScopes: readonly CategoryScope[];
  disabled?: boolean;
  placeholder?: string;
}) {
  const { t } = useTranslation(NS.settings);

  const scopeOptions = availableScopes.map((scope) => ({
    value: scope,
    label: t(
      `serviceDeskSettings.common.scope${
        scope === "INTERNAL" ? "Internal" : "Portal"
      }`,
    ),
  }));

  return (
    <Select
      items={scopeOptions}
      value={value}
      onValueChange={(scope) => {
        if (scope) {
          onValueChange(scope as CategoryScope);
        }
      }}
      disabled={disabled || availableScopes.length === 0}
    >
      <SelectTrigger className="min-w-28 shadow-sm">
        <SelectValue
          placeholder={placeholder ?? t("serviceDeskSettings.common.scope")}
        />
      </SelectTrigger>
      <SelectContent>
        {scopeOptions.map((scope) => (
          <SelectItem key={scope.value} value={scope.value}>
            {scope.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function LanguageSelect({
  language,
  onLanguageChange,
}: {
  language: Locale;
  onLanguageChange: (language: Locale) => void;
}) {
  const { t } = useTranslation(NS.settings);
  const localeOptions = getLanguageOptions(t);

  return (
    <Select
      items={localeOptions}
      value={language}
      onValueChange={(value) => onLanguageChange(value as Locale)}
    >
      <SelectTrigger className="min-w-28 shadow-sm">
        <Globe className="mr-1 size-4" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {localeOptions.map((locale) => (
          <SelectItem key={`select_item_${locale.value}`} value={locale.value}>
            {locale.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
