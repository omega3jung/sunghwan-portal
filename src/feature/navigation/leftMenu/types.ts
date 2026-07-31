import { LucideIcon } from "lucide-react";

import { AccessLevel } from "@/domain/auth";
import { LocalizedText } from "@/shared/types";

/** Distinguishes navigation links from structural menu groups. */
export type MenuItemType = "PAGE" | "GROUP";

/** Models one recursively nested item rendered by the left menu. */
export type MenuItem = {
  id: number;
  title: LocalizedText;
  path: string;
  icon: LucideIcon;
  type: MenuItemType;
  minAccessLevel?: AccessLevel; // minimum access level required to view this menu item.
  children?: MenuItem[];
};

/** Models the reduced menu identity used by page-level navigation controls. */
export type PageMenuItem = Omit<MenuItem, "type" | "children"> & {
  type: "PAGE";
};

/** Groups navigation items by the header, primary, and footer display regions. */
export type LeftMenuItems = {
  content: MenuItem[];
  footer: PageMenuItem[];
};

/** Describes the flat menu record returned by the navigation API. */
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
