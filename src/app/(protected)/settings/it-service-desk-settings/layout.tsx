// app/(protected)/settings/it-service-desk-settings/layout.tsx
"use client";

import { Bot, Tags, Workflow } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ItServiceDeskSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { t } = useTranslation("settings");

  const currentTab = pathname.split("/").at(-1);

  return (
    <main className="settings-main">
      <Tabs value={currentTab}>
        <TabsList className="w-full justify-start">
          <TabsTrigger value="category" asChild>
            <Link
              href="/settings/it-service-desk-settings/category"
              className="min-w-20 gap-2 flex items-center"
            >
              <Tags />
              {t("itServiceDeskSettings.general.category")}
            </Link>
          </TabsTrigger>

          <TabsTrigger value="approval-step" asChild>
            <Link
              href="/settings/it-service-desk-settings/approval-step"
              className="min-w-20 gap-2 flex items-center"
            >
              <Workflow />
              {t("itServiceDeskSettings.general.approvalStep")}
            </Link>
          </TabsTrigger>

          <TabsTrigger value="assignment-rule" asChild>
            <Link
              href="/settings/it-service-desk-settings/assignment-rule"
              className="min-w-20 gap-2 flex items-center"
            >
              <Bot />
              {t("itServiceDeskSettings.general.assignmentRule")}
            </Link>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* 👇 rendering tab page.tsx */}
      {children}
    </main>
  );
}
