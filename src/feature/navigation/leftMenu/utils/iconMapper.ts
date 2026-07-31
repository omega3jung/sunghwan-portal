// src/feature/navigation/leftMenu/utils/iconMapper.ts

import {
  BookOpen,
  CalendarRange,
  ChartLine,
  CircleUserRound,
  CodeXml,
  Contact,
  History,
  Home,
  ListCollapse,
  LucideIcon,
  Palette,
  RectangleEllipsis,
  Settings,
  Shapes,
  SquareStack,
  Ticket,
  Tickets,
  User,
  UserCog,
  UserKey,
  UserRoundCog,
  UserStar,
} from "lucide-react";

/** Maps persisted icon keys to the icon components supported by the navigation UI. */
export const leftMenuIconMap: Record<string, LucideIcon> = {
  BookOpen,
  CalendarRange,
  ChartLine,
  CircleUserRound,
  CodeXml,
  Contact,
  History,
  Home,
  ListCollapse,
  Palette,
  RectangleEllipsis,
  Settings,
  Shapes,
  SquareStack,
  Ticket,
  Tickets,
  User,
  UserCog,
  UserKey,
  UserRoundCog,
  UserStar,
};

/** Resolves a persisted icon key and falls back safely when the key is unknown. */
export function getLeftMenuIcon(iconKey: string): LucideIcon {
  return leftMenuIconMap[iconKey] ?? Home;
}
