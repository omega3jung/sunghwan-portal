import {
  Shapes,
  Home,
  Puzzle,
  BookOpen,
  Settings,
  CircleUserRound,
  CalendarRange,
  SquareStack,
  UserStar,
  User,
  UserCog,
  Contact,
} from "lucide-react";

// contents Items.
const content = [
  {
    title: "Home",
    path: "#",
    icon: Home,
  },
  {
    title: "Playground",
    path: "/playground",
    icon: Puzzle,
    children: [
      {
        title: "IT Help Desk",
        path: "/playground/it-help-desk",
        icon: Puzzle,
      },
    ],
  },
  {
    title: "Components Demo",
    path: "/demo",
    icon: Shapes,
    children: [
      {
        title: "Avatar Multi Combo Box",
        path: "/demo/avatar-multi-combo-box",
        icon: CircleUserRound,
      },
      {
        title: "Date Range Picker",
        path: "/demo/date-range-picker",
        icon: CalendarRange,
      },
      {
        title: "Multi Combobox",
        path: "/demo/multi-combo-box",
        icon: SquareStack,
      },
      { title: "Stepper", path: "/demo/stepper", icon: Shapes },
    ],
  },
  {
    title: "Role-based Rendering Menu",
    path: "/",
    icon: Shapes,
    children: [
      {
        title: "Manager Privilege Menu",
        path: "/",
        icon: UserStar,
      },
      {
        title: "Leader Privilege Menu",
        path: "/",
        icon: UserCog,
      },
      {
        title: "Employee Privilege Menu",
        path: "/",
        icon: User,
      },
      {
        title: "Visitor Privilege Menu",
        path: "/",
        icon: Contact,
      },
    ],
  },
];

// footer Items.
const footer = [
  {
    title: "Settings",
    path: "/settings",
    icon: Settings,
  },
  {
    title: "Documents",
    path: "/documents",
    icon: BookOpen,
  },
];

// menu Items.
export const menuItems = {
  content,
  footer,
};
