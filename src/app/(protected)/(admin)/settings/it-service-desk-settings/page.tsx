// src/app/(protected)/settings/it-service-desk/page.tsx
"use client";

import { Bot, Tags, Workflow } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ItServiceDeskSettingsPage() {
  const [tab, setTab] = useState<string>("category");
  const { t } = useTranslation("settings");

  const router = useRouter();

  const routeTab = (value: string) => {
    setTab(value);
    const path = `settings/it-service-desk-settings/${value}`;

    router.push(path);
  };

  return (
    <main className="settings-main">
      <Tabs value={tab} onValueChange={routeTab}>
        <TabsList className="w-full justify-start">
          <TabsTrigger
            value="category"
            className="min-w-20 gap-2 data-[state=inactive]:border-none"
          >
            <Tags />
            {t("serviceHub.general.category")}
          </TabsTrigger>
          <TabsTrigger
            value="approvalStep"
            className="min-w-20 gap-2 data-[state=inactive]:border-none"
          >
            <Workflow />
            {t("serviceHub.general.approvalStep")}
          </TabsTrigger>
          <TabsTrigger
            value="assignmentRule"
            className="wmin-w-20 gap-2 data-[state=inactive]:border-none"
          >
            <Bot />
            {t("serviceHub.general.assignmentRule")}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="category">
          <div>Category tab</div>
        </TabsContent>
        <TabsContent value="approvalStep">
          <div>Approval Step tab</div>
        </TabsContent>
        <TabsContent value="assignmentRule">
          <div>Assignment Rule tab</div>
        </TabsContent>
      </Tabs>
    </main>
  );
}
