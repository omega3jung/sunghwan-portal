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
import { getLanguageOptions } from "@/lib/client/i18n";
import { NS } from "@/lib/i18n";
import type { Locale } from "@/shared/types";

export function ServiceDeskSettingsLanguageSelect({
  language,
  onLanguageChange,
}: {
  language: Locale;
  onLanguageChange: (language: Locale) => void;
}) {
  const { t } = useTranslation(NS.settings);
  const localLocales = getLanguageOptions(t);

  return (
    <div className="flex items-center gap-2">
      <span className="text-nowrap">
        {t("serviceDeskSettings.common.categoryList")}
      </span>
      <Select
        value={language}
        onValueChange={(value) => onLanguageChange(value as Locale)}
      >
        <SelectTrigger className="border-none">
          <Globe className="w-4 mr-1" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {localLocales.map((locale) => (
            <SelectItem key={`select_item_${locale.value}`} value={locale.value}>
              {locale.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
