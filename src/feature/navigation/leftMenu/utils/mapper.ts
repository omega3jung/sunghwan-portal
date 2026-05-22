// src/feature/navigation/leftMenu/utils/mapper.ts

import type { DbMenuItem, MenuItem, MenuItemType } from "../types";
import { getLeftMenuIcon } from "./iconMapper";

type MenuItems = {
  content: MenuItem[];
  footer: MenuItem[];
};

type MenuArea = DbMenuItem["area"];

const ROOT_PARENT_ID = 0;

export function createLeftMenuFromDbMenuItem(
  dbItems: DbMenuItem[] | null | undefined,
): MenuItems {
  const safeItems = Array.isArray(dbItems) ? dbItems : [];

  const sortedItems = [...safeItems].sort((a, b) => {
    if (a.area !== b.area) return a.area.localeCompare(b.area);
    return a.order - b.order;
  });

  const childrenByParentId = new Map<number, DbMenuItem[]>();

  for (const item of sortedItems) {
    const parentId = item.parentId ?? ROOT_PARENT_ID;

    if (item.id === parentId) {
      console.warn(
        `[left-menu] Menu item cannot be its own parent. id=${item.id}`,
      );
      continue;
    }

    const children = childrenByParentId.get(parentId) ?? [];
    children.push(item);
    childrenByParentId.set(parentId, children);
  }

  const buildMenuItem = (item: DbMenuItem, area: MenuArea): MenuItem => {
    const children = (childrenByParentId.get(item.id) ?? [])
      .filter((child) => child.area === area)
      .sort((a, b) => a.order - b.order)
      .map((child) => buildMenuItem(child, area));
    const resolvedType: MenuItemType =
      item.type ?? (children.length > 0 ? "GROUP" : "PAGE");

    return {
      id: item.id,
      title: item.title,
      path: item.path,
      icon: getLeftMenuIcon(item.icon),
      type: resolvedType,
      minAccessLevel: item.minAccessLevel,
      ...(children.length > 0 ? { children } : {}),
    };
  };

  const buildArea = (area: MenuArea): MenuItem[] => {
    return (childrenByParentId.get(ROOT_PARENT_ID) ?? [])
      .filter((item) => item.area === area)
      .sort((a, b) => a.order - b.order)
      .map((item) => buildMenuItem(item, area));
  };

  return {
    content: buildArea("CONTENT"),
    footer: buildArea("FOOTER"),
  };
}
