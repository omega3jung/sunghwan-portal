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

import i18n from "@/lib/i18n";

const ns = {
  ns: "LeftMenu",
};

// contents Items.
const content = [
  {
    title: i18n.t("home", ns),
    path: "/",
    icon: Home,
  },
  {
    title: i18n.t("playground", ns),
    path: "/playground",
    icon: Puzzle,
    children: [
      {
        title: i18n.t("itHelpDesk", ns),
        path: "/playground/it-help-desk",
        icon: Puzzle,
      },
    ],
  },
  {
    title: i18n.t("componentsDemo", ns),
    path: "/demo",
    icon: Shapes,
    children: [
      {
        title: i18n.t("avatarMultiComboBox", ns),
        path: "/demo/avatar-multi-combo-box",
        icon: CircleUserRound,
      },
      {
        title: i18n.t("dateRangePicker", ns),
        path: "/demo/date-range-picker",
        icon: CalendarRange,
      },
      {
        title: i18n.t("multiCombobox", ns),
        path: "/demo/multi-combo-box",
        icon: SquareStack,
      },
      { title: i18n.t("stepper", ns), path: "/demo/stepper", icon: Shapes },
    ],
  },
  {
    title: i18n.t("permissionBasedRenderingMenu", ns),
    path: "/",
    icon: Shapes,
    children: [
      {
        title: i18n.t("adminPrivilegeMenu", ns),
        path: "/",
        icon: UserStar,
      },
      {
        title: i18n.t("managerPrivilegeMenu", ns),
        path: "/",
        icon: UserCog,
      },
      {
        title: i18n.t("userPrivilegeMenu", ns),
        path: "/",
        icon: User,
      },
      {
        title: i18n.t("guestPrivilegeMenu", ns),
        path: "/",
        icon: Contact,
      },
    ],
  },
];

// footer Items.
const footer = [
  {
    title: i18n.t("settings", ns),
    path: "/settings",
    icon: Settings,
  },
  {
    title: i18n.t("documents", ns),
    path: "/documents",
    icon: BookOpen,
  },
];

// menu Items.
export const menuItems = {
  content,
  footer,
};
