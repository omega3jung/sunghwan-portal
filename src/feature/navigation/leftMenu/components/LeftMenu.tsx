"use client";

import { Settings2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

import { PreferencesMenu } from "@/components/menu/PreferencesMenu";
import {
  Sidebar,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { useCurrentPreference } from "@/feature/user/preference/client";
import { useLocalizedText } from "@/lib/client/i18n";
import { ENVIRONMENT } from "@/lib/config/environment";

import { useLeftMenuQuery } from "../api/queries";
import type { PageMenuItem } from "../types";
import { CollapsibleMenu } from "./CollapsibleMenu";
import { GroupMenu } from "./GroupMenu";
import { LeftMenuSkeleton } from "./MenuSkeleton";

const collapsedMenuButtonClassName =
  "group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center";
const collapsedMenuItemClassName =
  "group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:justify-center";

export function LeftMenu() {
  const pathname = usePathname();
  const tLocal = useLocalizedText();
  const { isMobile } = useSidebar();
  const {
    current: { menu },
  } = useCurrentPreference();
  const { data: menuItems, isLoading } = useLeftMenuQuery();

  const content = useMemo(() => menuItems?.content ?? [], [menuItems]);
  const footer = useMemo(() => menuItems?.footer ?? [], [menuItems]);

  const isActivePath = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  const renderFooterItem = (item: PageMenuItem) => {
    const title = tLocal(item.title);

    return (
      <SidebarMenuItem key={item.id} className={collapsedMenuItemClassName}>
        <SidebarMenuButton
          render={<Link href={item.path} />}
          tooltip={title}
          isActive={isActivePath(item.path)}
          className={collapsedMenuButtonClassName}
        >
          <item.icon />
          <span className="group-data-[collapsible=icon]:hidden">{title}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar collapsible="icon" className="group">
      <SidebarHeader className="h-14 flex-row items-center justify-between p-2.5 group-data-[state=collapsed]:justify-center">
        {!isMobile && <SidebarTrigger />}

        <Image
          src={`${ENVIRONMENT.BASE_PATH}/images/logo_light.png`}
          alt="Portal Logo"
          className="h-10 w-auto shrink-0 dark:hidden group-data-[state=collapsed]:hidden group-data-[state=collapsed]:transition-all"
          width={800}
          height={300}
          sizes="100px"
          priority
        />

        <Image
          src={`${ENVIRONMENT.BASE_PATH}/images/logo_dark.png`}
          alt="Portal Logo"
          className="hidden h-10 w-auto shrink-0 dark:block group-data-[state=collapsed]:hidden group-data-[state=collapsed]:transition-all"
          width={800}
          height={300}
          sizes="100px"
          priority
        />
      </SidebarHeader>

      <SidebarSeparator className="mx-0" />

      {isLoading ? (
        <LeftMenuSkeleton />
      ) : menu === "group" ? (
        <GroupMenu items={content} />
      ) : (
        <CollapsibleMenu items={content} />
      )}

      <SidebarFooter>
        <SidebarMenu>
          {footer.map(renderFooterItem)}

          <SidebarMenuItem
            key="Preferences"
            className={collapsedMenuItemClassName}
          >
            <PreferencesMenu
              trigger={({ label }) => (
                <SidebarMenuButton className={collapsedMenuButtonClassName}>
                  <Settings2 />
                  <span className="group-data-[collapsible=icon]:hidden">
                    {label}
                  </span>
                </SidebarMenuButton>
              )}
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
