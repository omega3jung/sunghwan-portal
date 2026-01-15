import type { LucideProps } from "lucide-react";
import type { ForwardRefExoticComponent, RefAttributes } from "react";

import { AccessLevel } from "../user";
import { Locale } from "./language";

export type LucideIcon = ForwardRefExoticComponent<
  Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
>;

export type ScreenMode = "light" | "dark" | "system";
export type ColorTheme = "default" | "emerald" | "ruby" | "sapphire" | "topaz";
export type MenuItem = {
  title: string;
  path: string;
  icon: LucideIcon;
  minAccessLevel?: AccessLevel; // minimum access level required to view this menu item.
  children?: MenuItem[];
};

export interface Preference {
  screenMode: ScreenMode;
  colorTheme: ColorTheme;
  language: Locale;
}
