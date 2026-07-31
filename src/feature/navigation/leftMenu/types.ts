import { LucideIcon } from "lucide-react";

import { AccessLevel } from "@/domain/auth";
import { LocalizedText } from "@/shared/types";

export type MenuItemType = "PAGE" | "GROUP";

export type MenuItem = {
  id: number;
  title: LocalizedText;
  path: string;
  icon: LucideIcon;
  type: MenuItemType;
  minAccessLevel?: AccessLevel; // minimum access level required to view this menu item.
  children?: MenuItem[];
};

export type PageMenuItem = Omit<MenuItem, "type" | "children"> & {
  type: "PAGE";
};

export type LeftMenuItems = {
  content: MenuItem[];
  footer: PageMenuItem[];
};

export type DbMenuItem = {
  id: number;
  parentId: number | null;
  title: LocalizedText;
  path: string;
  icon: string;
  type: MenuItemType;
  area: "CONTENT" | "FOOTER";
  order: number;
  minAccessLevel: AccessLevel;
};
