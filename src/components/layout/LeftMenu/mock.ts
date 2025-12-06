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
    title: "Custom Components",
    url: "/home/customs",
    icon: Shapes,
    children: [
      { title: "Date Range Picker", path: "/home/customs/date-range-picker" },
      { title: "Multi Combobox", path: "/home/customs/multi-combo-box" },
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
