"use client";

import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { useRouteLoading } from "@/components/layout/RouteLoading";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@/components/ui/navigation-menu";
import { NS } from "@/lib/application/i18n";
import { createSettingsNavigationMock } from "@/mocks/ui/navigation/settingsNavigation";
import { cn } from "@/shared/utils/presentation";

import { useSettingsAccess } from "../_providers";
import { ENABLED_SETTINGS_ROUTES } from "../constants";

const SERVICE_DESK_TENANT_SETTINGS_PATH =
  "/settings/service-desk-settings/tenant";

export function SettingsNavigation() {
  const { t } = useTranslation(NS.settings);
  const { type } = useSettingsAccess();
  const settingsNavigationItems = createSettingsNavigationMock(t).map(
    (group) => ({
      ...group,
      items:
        type === "TENANT_ADMIN"
          ? group.items.filter(
              (item) => item.path !== SERVICE_DESK_TENANT_SETTINGS_PATH,
            )
          : group.items,
    }),
  );

  const router = useRouter();
  const { startRouteLoadingForHref } = useRouteLoading();

  const handleNavigate = (path: string) => {
    if (!ENABLED_SETTINGS_ROUTES.has(path)) {
      toast.info(t("disabledRouteMessage.title"), {
        description: t("disabledRouteMessage.description"),
        position: "top-center",
        duration: 5000,
      });
      return;
    }

    startRouteLoadingForHref(path);
    router.push(path);
  };

  return (
    <NavigationMenu>
      <NavigationMenuList className="flex-wrap">
        {settingsNavigationItems.map((settingMenu) => (
          <NavigationMenuItem key={settingMenu.triggerTitle}>
            <NavigationMenuTrigger>
              {settingMenu.triggerTitle}
            </NavigationMenuTrigger>
            <NavigationMenuContent className="grid p-2 gap-2 sm:w-[440px] md:w-[500px] md:grid-cols-2 lg:w-[600px]">
              {settingMenu.items.map((item) => (
                <NavigationMenuLink
                  asChild
                  key={item.title}
                  title={item.title}
                  className="flex flex-col p-2 gap-1 rounded-md"
                >
                  <Button
                    type="button"
                    variant={"ghost"}
                    onClick={() => handleNavigate(item.path)}
                    className={cn(
                      "w-full h-full flex flex-col items-start justify-start text-left",
                    )}
                  >
                    <p className="text-sm leading-none font-medium h-fit">
                      {item.title}
                    </p>
                    <p
                      className={cn(
                        "text-muted-foreground text-sm leading-snug text-wrap",
                      )}
                    >
                      {item.description}
                    </p>
                  </Button>
                </NavigationMenuLink>
              ))}
            </NavigationMenuContent>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
      <NavigationMenuViewport />
    </NavigationMenu>
  );
}
