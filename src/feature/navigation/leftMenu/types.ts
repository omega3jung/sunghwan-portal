import { LucideIcon } from "lucide-react";

import { AccessLevel } from "@/domain/auth";
import { LocalizedText } from "@/shared/types";

/** Distinguishes navigable pages from structural menu groups. */
export type MenuItemType = "PAGE" | "GROUP";

/** Recursively nested item rendered by the left menu. */
export type MenuItem = {
  id: number;
  title: LocalizedText;
  path: string;
  icon: LucideIcon;
  type: MenuItemType;
  minAccessLevel?: AccessLevel;
  children?: MenuItem[];
};

/** Reduced page identity used by navigation controls that cannot contain groups. */
export type PageMenuItem = Omit<MenuItem, "type" | "children"> & {
  type: "PAGE";
};

export type LeftMenuItems = {
  content: MenuItem[];
  footer: PageMenuItem[];
};

/** Flat menu record returned by the navigation API before tree reconstruction. */
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
