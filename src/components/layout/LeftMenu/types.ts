import { LucideIcon } from "lucide-react";

import { AccessLevel } from "@/domain/auth";

export type MenuItem = {
  title: string;
  path: string;
  icon: LucideIcon;
  minAccessLevel?: AccessLevel; // minimum access level required to view this menu item.
  children?: MenuItem[];
};
