import { ChevronRight, Settings2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { useLocalizedText } from "@/lib/client/i18n";
import { ENVIRONMENT } from "@/lib/environment";

import { useLeftMenuQuery } from "../api/queries";
import type { MenuItem } from "../types";
import { LeftMenuSkeleton } from "./MenuSkeleton";

export function LeftMenu() {
  const pathname = usePathname();
  const tLocal = useLocalizedText();
  const { isMobile } = useSidebar();
  const { data: menuItems, isLoading } = useLeftMenuQuery();

  const content = useMemo(() => menuItems?.content ?? [], [menuItems]);
  const footer = useMemo(() => menuItems?.footer ?? [], [menuItems]);

  const isActivePath = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  const isItemActive = (item: MenuItem): boolean => {
    if (item.type === "PAGE") {
      return isActivePath(item.path);
    }

    return item.children?.some(isItemActive) ?? false;
  };

  const renderRootPageItem = (item: MenuItem) => {
    const title = tLocal(item.title);

    return (
      <SidebarMenuItem key={item.id}>
        <SidebarMenuButton
          asChild
          tooltip={title}
          isActive={isActivePath(item.path)}
        >
          <Link href={item.path}>
            <item.icon />
            <span>{title}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  const renderSubPageItem = (item: MenuItem) => {
    return (
      <SidebarMenuSubItem key={item.id}>
        <SidebarMenuSubButton
          asChild
          isActive={isActivePath(item.path)}
          className="ml-0.5"
        >
          <Link href={item.path}>
            <item.icon />
            <span>{tLocal(item.title)}</span>
          </Link>
        </SidebarMenuSubButton>
      </SidebarMenuSubItem>
    );
  };

  const renderSubGroupItem = (item: MenuItem) => {
    const children = item.children ?? [];

    if (children.length === 0) {
      return null;
    }

    return (
      <SidebarMenuSubItem key={item.id}>
        <Collapsible
          defaultOpen={true}
          //defaultOpen={isItemActive(item)}
          className="group/sub-collapsible"
        >
          <CollapsibleTrigger asChild>
            <SidebarMenuSubButton className="w-full ml-0.5">
              <item.icon />
              <span>{tLocal(item.title)}</span>
              <ChevronRight className="ml-auto size-3.5 transition-transform group-data-[state=open]/sub-collapsible:rotate-90" />
            </SidebarMenuSubButton>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <SidebarMenuSub className="mr-0 border-l border-sidebar-border px-0 py-1">
              {children.map(renderSubMenuItem)}
            </SidebarMenuSub>
          </CollapsibleContent>
        </Collapsible>
      </SidebarMenuSubItem>
    );
  };

  const renderSubMenuItem = (item: MenuItem) => {
    if (item.type === "GROUP") {
      return renderSubGroupItem(item);
    }

    return renderSubPageItem(item);
  };

  const renderRootGroupItem = (item: MenuItem) => {
    const children = item.children ?? [];
    const title = tLocal(item.title);

    if (children.length === 0) return null;

    return (
      <Collapsible
        key={item.id}
        defaultOpen={true}
        //defaultOpen={isItemActive(item)}
        className="group/collapsible"
      >
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton
              tooltip={title}
              isActive={isItemActive(item)}
              className="w-full"
            >
              <item.icon />
              <span>{title}</span>
              <ChevronRight className="ml-auto size-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
            </SidebarMenuButton>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <SidebarMenuSub className="mr-0 border-l border-sidebar-border p-0 py-1">
              {children.map(renderSubMenuItem)}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    );
  };

  const renderRootMenuItem = (item: MenuItem) => {
    if (item.type === "GROUP") {
      return renderRootGroupItem(item);
    }

    return renderRootPageItem(item);
  };

  if (isLoading) {
    return <LeftMenuSkeleton />;
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-14 flex flex-row justify-between items-center p-2.5">
        {!isMobile && <SidebarTrigger />}
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

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>{content.map(renderRootMenuItem)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          {footer.map(renderRootMenuItem)}

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
