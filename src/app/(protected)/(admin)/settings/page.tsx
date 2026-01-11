// src/app/(protected)/settings/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { createSettingsCardMock } from "@/app/_mocks/pages/settings";
import { Card } from "@/components/ui/card";
import { cn } from "@/utils";

import { ENABLED_SETTINGS_ROUTES } from "./constants";
import { SETTINGS_THEME } from "./constants/style";

export default function SettingsPage() {
  const { t } = useTranslation("settings");
  const settingsCardItems = createSettingsCardMock(t);

  const router = useRouter();

  const handleNavigate = (path: string) => {
    if (!ENABLED_SETTINGS_ROUTES.has(path)) {
      toast.info(t("disabledRouteMessage.title"), {
        description: t("disabledRouteMessage.description"),
        position: "top-center",
        duration: 5000,
      });
      return;
    }

    router.push(path);
  };

  return (
    <main className="settings-main p-4">
      <div className="grid grid-cols-[repeat(auto-fill,minmax(18rem,1fr))] gap-8 p-9">
        {settingsCardItems.map((item, idx) => {
          const theme = SETTINGS_THEME[idx % SETTINGS_THEME.length];

          return (
            <Card
              key={item.triggerTitle}
              className={cn(
                "grid aspect-square max-w-72 shadow-md p-4 rounded-lg cursor-pointer hover:outline",
                theme.bg,
                theme.hover
              )}
              onClick={() => {
                //router.push(item.path);
                handleNavigate(item.path);
              }}
            >
              <div className="row-span-2 flex justify-center items-end">
                <item.icon size={50} className={cn(theme.icon)} />
              </div>
              <div className="font-medium flex justify-center">
                {t(item.triggerTitle)}
              </div>
              <div className="row-span-2 opacity-70">
                {t(item.triggerDescription)}
              </div>
            </Card>
          );
        })}
      </div>
    </main>
  );
}
