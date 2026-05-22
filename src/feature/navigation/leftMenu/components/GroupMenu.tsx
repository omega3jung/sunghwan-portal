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

export function LeftMenu() {
  const tLocal = useLocalizedText();
  const { data: menuItems } = useLeftMenuQuery();

  const content = useMemo(() => menuItems?.content ?? [], [menuItems]);
  const footer = useMemo(() => menuItems?.footer ?? [], [menuItems]);

  const renderPageItem = (item: MenuItem) => {
    const title = tLocal(item.title);

    return (
      <SidebarMenu key={item.id}>
        <SidebarMenuItem>
          <SidebarMenuButton asChild tooltip={title}>
            <Link href={item.path}>
              <item.icon />
              <span>{title}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
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
          <item.icon />
          <span>{tLocal(item.title)}</span>
        </SidebarGroupLabel>
        <SidebarGroupContent>{children.map(renderMenuItem)}</SidebarGroupContent>
      </SidebarGroup>
    );
  };

  const renderMenuItem = (item: MenuItem) => {
    if (item.type === "GROUP") {
      return renderGroupItem(item);
    }

    return renderPageItem(item);
  };

  return (
    <Sidebar collapsible="icon" className="group">
      <SidebarHeader className="h-14 flex flex-row justify-between items-center p-2.5">
        <SidebarTrigger />
        <Image
          src={`${ENVIRONMENT.BASE_PATH}/images/logo_light.png`}
          alt="Portal Logo"
          className="block dark:hidden
          group-data-[state=collapsed]:transition-all group-data-[state=collapsed]:hidden"
          width={120}
          height={32}
          priority
        />
        <Image
          src={`${ENVIRONMENT.BASE_PATH}/images/logo_dark.png`}
          alt="Portal Logo"
          className="hidden dark:block
          group-data-[state=collapsed]:transition-all group-data-[state=collapsed]:hidden"
          width={120}
          height={32}
          priority
        />
      </SidebarHeader>
      <SidebarSeparator className="mx-0" />
      <SidebarContent>{content.map(renderMenuItem)}</SidebarContent>
      <SidebarFooter>
        {footer.map(renderMenuItem)}
        <SidebarMenuItem key={"Preferences"}>
          <PreferencesMenu
            trigger={({ label }) => (
              <SidebarMenuButton>
                <Settings2 />
                <span>{label}</span>
              </SidebarMenuButton>
            )}
          />
        </SidebarMenuItem>
      </SidebarFooter>
    </Sidebar>
  );
}
