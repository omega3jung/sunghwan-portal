"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

import { useRouteLoading } from "@/components/layout/RouteLoading";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { toast } from "@/components/ui/toast";
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

  const pathname = usePathname();
  const router = useRouter();
  const { startRouteLoadingForHref } = useRouteLoading();

  const handleNavigate = (path: string) => {
    if (!ENABLED_SETTINGS_ROUTES.has(path)) {
      toast.add({
        title: t("disabledRouteMessage.title"),
        description: t("disabledRouteMessage.description"),
        timeout: 5000,
        type: "info",
      });
      return;
    }

    startRouteLoadingForHref(path);
    router.push(path);
  };

  return (
    <NavigationMenu className="justify-start gap-2 p-2">
      <NavigationMenuList className="flex-wrap gap-1">
        {settingsNavigationItems.map((settingMenu) => (
          <NavigationMenuItem key={settingMenu.triggerTitle}>
            <NavigationMenuTrigger className="h-9 px-3 text-sm">
              {settingMenu.triggerTitle}
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="max-h-[60vh] w-150 max-w-[calc(100vw-2rem)] overflow-y-auto p-3 pr-4">
                <div className="grid gap-1 md:grid-cols-2">
                  {settingMenu.items.map((item) => (
                    <Button
                      key={item.path}
                      type="button"
                      variant="ghost"
                      onClick={() => handleNavigate(item.path)}
                      className={cn(
                        "h-auto w-full flex-row items-center justify-start gap-3 whitespace-normal px-3 py-2 text-left font-normal",
                        pathname === item.path && "bg-primary/10 text-primary",
                      )}
                      title={item.triggerTitle}
                    >
                      <item.icon
                        aria-hidden="true"
                        className="size-5 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="block text-sm font-medium">
                          {item.triggerTitle}
                        </span>
                        <span className="mt-0.5 line-clamp-2 block text-xs font-normal leading-5 text-muted-foreground">
                          {item.triggerDescription}
                        </span>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
