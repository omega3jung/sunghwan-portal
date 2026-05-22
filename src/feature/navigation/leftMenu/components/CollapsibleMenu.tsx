import { ChevronRight, Settings2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";

import { PreferencesMenu } from "@/components/menu/PreferencesMenu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
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
      <SidebarMenuItem key={item.id}>
        <Collapsible className="group/collapsible">
          <CollapsibleTrigger asChild>
            <SidebarMenuButton tooltip={tLocal(item.title)}>
              <item.icon />
              <span>{tLocal(item.title)}</span>
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <SidebarMenuBadge>
            <ChevronRight className="h-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuBadge>
          <CollapsibleContent>
            <SidebarMenu className="pl-2">{children.map(renderMenuItem)}</SidebarMenu>
          </CollapsibleContent>
        </Collapsible>
      </SidebarMenuItem>
    );
  };

  const renderMenuItem = (item: MenuItem) => {
    if (item.type === "GROUP") {
      return renderGroupItem(item);
    }

    return renderPageItem(item);
  };

  return (
    <Sidebar collapsible="icon">
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
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Portfolio Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{content.map(renderMenuItem)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
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
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
