"use client";

import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NS } from "@/lib/application/i18n";
import { getLanguageOptions } from "@/lib/client/i18n";
import type { Locale } from "@/shared/types";

export function ServiceDeskSettingsLanguageEditor({
  activeLanguage,
  onLanguageChange,
  children,
}: {
  activeLanguage: Locale;
  onLanguageChange: (language: Locale) => void;
  children: ReactNode;
}) {
  const { t } = useTranslation(NS.settings);
  const languageOptions = getLanguageOptions(t);

  return (
    <div className="min-w-0">
      <Tabs
        value={activeLanguage}
        onValueChange={(value) => onLanguageChange(value as Locale)}
      >
        <TabsList className="w-full justify-start">
          {languageOptions.map((option) => (
            <TabsTrigger
              key={option.value}
              value={option.value}
              className="min-w-20 gap-2 data-[state=inactive]:border-none"
            >
              {option.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <div className="mt-8 pt-2">{children}</div>
    </div>
  );
}

export function ServiceDeskSettingsEditorEmptyState({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="h-full rounded-lg border border-dashed p-7 text-sm text-muted-foreground">
      {children}
    </div>
  );
}
