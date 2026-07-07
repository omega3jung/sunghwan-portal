// src/feature/navigation/leftMenu/utils/leftMenuIconMap.ts

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

export function getLeftMenuIcon(iconKey: string): LucideIcon {
  return leftMenuIconMap[iconKey] ?? Home;
}
