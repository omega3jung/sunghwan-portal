"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { useLocalizedText } from "@/lib/client/i18n";

import type { MenuItem } from "../types";

type CollapsibleMenuProps = {
  items: MenuItem[];
};

/** Documents the collapsible menu responsibility exposed by this client feature module. */
export function CollapsibleMenu({ items }: CollapsibleMenuProps) {
  const pathname = usePathname();
  const tLocal = useLocalizedText();

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
          render={<Link href={item.path} />}
          tooltip={title}
          isActive={isActivePath(item.path)}
        >
          <item.icon />
          <span>{title}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  const renderSubPageItem = (item: MenuItem) => {
    return (
      <SidebarMenuSubItem key={item.id}>
        <SidebarMenuSubButton
          render={<Link href={item.path} />}
          isActive={isActivePath(item.path)}
          className="ml-0.5"
        >
          <item.icon />
          <span>{tLocal(item.title)}</span>
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
          className="group/sub-collapsible"
        >
          <CollapsibleTrigger
            nativeButton={false}
            render={<SidebarMenuSubButton className="ml-0.5 w-full" />}
          >
            <item.icon />
            <span>{tLocal(item.title)}</span>
            <ChevronRight className="ml-auto size-3.5 transition-transform group-data-open/sub-collapsible:rotate-90" />
          </CollapsibleTrigger>

          <CollapsibleContent>
            <SidebarMenuSub className="mr-0 px-0 py-1">
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
        className="group/collapsible"
      >
        <SidebarMenuItem>
          <CollapsibleTrigger
            render={
              <SidebarMenuButton
                tooltip={title}
                isActive={isItemActive(item)}
              />
            }
          >
            <item.icon />
            <span>{title}</span>
            <ChevronRight className="ml-auto size-4 transition-transform group-data-open/collapsible:rotate-90" />
          </CollapsibleTrigger>

          <CollapsibleContent>
            <SidebarMenuSub className="mr-0 p-0 py-1">
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

  return (
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>{items.map(renderRootMenuItem)}</SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  );
}
