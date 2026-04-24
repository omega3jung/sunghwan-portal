"use client";

import { useTranslation } from "react-i18next";

import { NS } from "@/lib/i18n";

export default function ServiceDeskReportsPage() {
  const { t } = useTranslation(NS.serviceDesk);

  return (
    <main className="p-6">
      <h1 className="text-lg font-semibold">{t("reports.title")}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {t("reports.description")}
      </p>
    </main>
  );
}
