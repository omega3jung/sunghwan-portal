"use client";

import Link from "next/link";

import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useLocalizedText } from "@/lib/client/i18n";

import type { MenuItem } from "../types";

const collapsedMenuButtonClassName =
  "group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center";
const collapsedMenuItemClassName =
  "group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:justify-center";
const rootMenuItemClassName = `${collapsedMenuItemClassName} pt-2 pl-2 group-data-[collapsible=icon]:pl-0`;

type GroupMenuProps = {
  items: MenuItem[];
};

export function GroupMenu({ items }: GroupMenuProps) {
  const tLocal = useLocalizedText();

  const renderPageItem = (item: MenuItem, isRoot = false) => {
    const title = tLocal(item.title);

    return (
      <SidebarMenuItem
        key={item.id}
        className={isRoot ? rootMenuItemClassName : collapsedMenuItemClassName}
      >
        <SidebarMenuButton
          render={<Link href={item.path} />}
          tooltip={title}
          className={collapsedMenuButtonClassName}
        >
          <item.icon />
          <span className="group-data-[collapsible=icon]:hidden">{title}</span>
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
      <SidebarGroup
        key={item.id}
        className="pr-0 group-data-[collapsible=icon]:px-0"
      >
        <SidebarGroupLabel className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
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

  const renderRootMenuItem = (item: MenuItem) => {
    if (item.type === "GROUP") {
      return renderGroupItem(item);
    }

    return renderPageItem(item, true);
  };

  return (
    <SidebarContent className="pr-2 group-data-[collapsible=icon]:pr-0">
      {items.map(renderRootMenuItem)}
    </SidebarContent>
  );
}
