import { Shapes, Home, Puzzle, BookOpen, Settings } from "lucide-react";

// Menu items.
export const items = [
  {
    title: "Home",
    url: "#",
    icon: Home,
  },
  {
    title: "Playground",
    url: "/home/playground",
    icon: Puzzle,
    children: [{ title: "IT Help Desk", path: "/home/playground/it-help-desk" }],
  },
  {
    title: "Components Demo",
    url: "/home/demo",
    icon: Shapes,
    children: [
      { title: "Avatar Multi Combo Box", path: "/home/demo/avatar-multi-combo-box" },
      { title: "Date Range Picker", path: "/home/demo/date-range-picker" },
      { title: "Multi Combobox", path: "/home/demo/multi-combo-box" },
    ],
  },
  {
    title: "Documents",
    url: "/home/documents",
    icon: BookOpen,
  },
  {
    title: "Settings",
    url: "/home/settings",
    icon: Settings,
  },
];
