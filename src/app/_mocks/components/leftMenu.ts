import type { TFunction } from "i18next";
import {
  BookOpen,
  CalendarRange,
  CircleUserRound,
  Contact,
  Home,
  Puzzle,
  Settings,
  Shapes,
  SquareStack,
  User,
  UserCog,
  UserStar,
} from "lucide-react";

import { ACCESS_LEVEL, type MenuItem } from "@/types";

const ns = { ns: "LeftMenu" };

type MenuItems = { content: MenuItem[]; footer: MenuItem[] };

export function createMenuMock(t: TFunction): MenuItems {
  return {
    content: [
      {
        title: t("home", ns),
        path: "/",
        icon: Home,
      },
      {
        title: t("playground", ns),
        path: "/playground",
        icon: Puzzle,
        children: [
          {
            title: t("itServiceDesk", ns),
            path: "/playground/it-service-desk",
            icon: Puzzle,
          },
        ],
      },
      {
        title: t("componentsDemo", ns),
        path: "/demo",
        icon: Shapes,
        children: [
          {
            title: t("avatarMultiComboBox", ns),
            path: "/demo/avatar-multi-combo-box",
            icon: CircleUserRound,
          },
          {
            title: t("dateRangePicker", ns),
            path: "/demo/date-range-picker",
            icon: CalendarRange,
          },
          {
            title: t("multiCombobox", ns),
            path: "/demo/multi-combo-box",
            icon: SquareStack,
          },
          {
            title: t("stepper", ns),
            path: "/demo/stepper",
            icon: Shapes,
          },
        ],
      },
      {
        title: t("permissionBasedRenderingMenu", ns),
        path: "/",
        icon: Shapes,
        children: [
          {
            title: t("adminPrivilegeMenu", ns),
            path: "/",
            icon: UserStar,
            minAccessLevel: ACCESS_LEVEL.ADMIN,
          },
          {
            title: t("managerPrivilegeMenu", ns),
            path: "/",
            icon: UserCog,
            minAccessLevel: ACCESS_LEVEL.MANAGER,
          },
          {
            title: t("userPrivilegeMenu", ns),
            path: "/",
            icon: User,
            minAccessLevel: ACCESS_LEVEL.USER,
          },
          {
            title: t("guestPrivilegeMenu", ns),
            path: "/",
            icon: Contact,
            minAccessLevel: ACCESS_LEVEL.GUEST,
          },
        ],
      },
    ],
    footer: [
      {
        title: t("settings", ns),
        path: "/settings",
        icon: Settings,
      },
      {
        title: t("documents", ns),
        path: "/documents",
        icon: BookOpen,
      },
    ],
  };
}
