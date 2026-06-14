// app/(protected)/settings/service-desk-settings/layout.tsx
"use client";

import { Bot, Building2, Tags, Workflow } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NS } from "@/lib/i18n";

export default function ServiceDeskSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { t } = useTranslation(NS.settings);

  const currentTab = pathname.split("/").at(-1);

  return (
    <main className="settings-main">
      <Tabs value={currentTab}>
        <TabsList className="w-full justify-start">
          <TabsTrigger value="tenant" asChild>
            <Link
              href="/settings/service-desk-settings/tenant"
              className="min-w-20 gap-2 flex items-center"
            >
              <Building2 />
              {t("serviceDeskSettings.common.tenant")}
            </Link>
          </TabsTrigger>

          <TabsTrigger value="category" asChild>
            <Link
              href="/settings/service-desk-settings/category"
              className="min-w-20 gap-2 flex items-center"
            >
              <Tags />
              {t("serviceDeskSettings.common.category")}
            </Link>
          </TabsTrigger>

          <TabsTrigger value="approval-step" asChild>
            <Link
              href="/settings/service-desk-settings/approval-step"
              className="min-w-20 gap-2 flex items-center"
            >
              <Workflow />
              {t("serviceDeskSettings.common.approvalStep")}
            </Link>
          </TabsTrigger>
          <TabsTrigger value="assignment-rule" asChild>
            <Link
              href="/settings/service-desk-settings/assignment-rule"
              className="min-w-20 gap-2 flex items-center"
            >
              <Bot />
              {t("serviceDeskSettings.common.assignmentRule")}
            </Link>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* 👇 rendering tab page.tsx */}
      {children}
    </main>
  );
}
