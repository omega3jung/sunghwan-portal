import { Settings2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";

import { PreferencesMenu } from "@/components/menu/PreferencesMenu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ENVIRONMENT } from "@/lib/environment";
import { useLocalizedText } from "@/shared/hooks";

import { useLeftMenuQuery } from "../api/queries";
import type { MenuItem } from "../types";
import { LeftMenuSkeleton } from "./MenuSkeleton";

export function LeftMenu() {
  const tLocal = useLocalizedText();
  const { data: menuItems, isLoading } = useLeftMenuQuery();

  const content = useMemo(() => menuItems?.content ?? [], [menuItems]);
  const footer = useMemo(() => menuItems?.footer ?? [], [menuItems]);

  const renderPageItem = (item: MenuItem) => {
    const title = tLocal(item.title);

    return (
      <SidebarMenuItem key={item.id}>
        <SidebarMenuButton asChild tooltip={title}>
          <Link href={item.path}>
            <item.icon />
            <span>{title}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  const renderGroupItem = (item: MenuItem) => {
    const children = item.children ?? [];

    if (children.length === 0) {
      return null;
    }

    return (
      <SidebarGroup key={item.id}>
        <SidebarGroupLabel className="flex items-center gap-2">
          <item.icon className="size-4" />
          <span>{tLocal(item.title)}</span>
        </SidebarGroupLabel>

        <SidebarGroupContent>
          <SidebarMenu>{children.map(renderMenuItem)}</SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  };

  const renderMenuItem = (item: MenuItem) => {
    if (item.type === "GROUP") {
      return renderGroupItem(item);
    }

    return renderPageItem(item);
  };

  if (isLoading) {
    return <LeftMenuSkeleton />;
  }

  return (
    <Sidebar collapsible="icon" className="group">
      <SidebarHeader className="h-14 flex flex-row justify-between items-center p-2.5">
        <SidebarTrigger />

        <Image
          src={`${ENVIRONMENT.BASE_PATH}/images/logo_light.png`}
          alt="Portal Logo"
          className="block dark:hidden group-data-[state=collapsed]:transition-all group-data-[state=collapsed]:hidden"
          width={120}
          height={32}
          priority
        />

        <Image
          src={`${ENVIRONMENT.BASE_PATH}/images/logo_dark.png`}
          alt="Portal Logo"
          className="hidden dark:block group-data-[state=collapsed]:transition-all group-data-[state=collapsed]:hidden"
          width={120}
          height={32}
          priority
        />
      </SidebarHeader>

      <SidebarSeparator className="mx-0" />

      <SidebarContent>{content.map(renderMenuItem)}</SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          {footer.map((item) => {
            if (item.type === "GROUP") {
              return null;
            }

            return renderPageItem(item);
          })}

          <SidebarMenuItem key="Preferences">
            <PreferencesMenu
              trigger={({ label }) => (
                <SidebarMenuButton>
                  <Settings2 />
                  <span>{label}</span>
                </SidebarMenuButton>
              )}
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
