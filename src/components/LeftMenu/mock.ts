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
    url: "/playground",
    icon: Puzzle,
    children: [{ title: "IT Help Desk", path: "/playground/helpdesk" }],
  },
  {
    title: "Custom Components",
    url: "/components",
    icon: Shapes,
    children: [
      { title: "Date Range Picker", path: "/components/dateRangePicker" },
    ],
  },
  {
    title: "Documents",
    url: "/documents",
    icon: BookOpen,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];
