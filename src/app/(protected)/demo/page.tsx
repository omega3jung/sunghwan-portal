"use client";

import { useTranslation } from "react-i18next";

import { NS } from "@/lib/application/i18n";

export default function DemoPage() {
  const { t } = useTranslation(NS.demo, { keyPrefix: "indexPage" });

  return (
    <main className="space-y-2 p-4">
      <h1 className="text-xl font-semibold">{t("title")}</h1>
      <p className="text-sm text-muted-foreground">{t("description")}</p>
    </main>
  );
}
