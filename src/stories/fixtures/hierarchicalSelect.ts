import type { HierarchicalSelectItem } from "@/components/custom/HierarchicalSelect";

export const hierarchicalItems: HierarchicalSelectItem[] = [
  {
    value: "engineering",
    label: "Engineering",
    children: [
      { value: "frontend", label: "Frontend" },
      { value: "backend", label: "Backend" },
      { value: "platform", label: "Platform" },
    ],
  },
  {
    value: "operations",
    label: "Operations",
    children: [
      { value: "service-desk", label: "Service Desk" },
      { value: "facilities", label: "Facilities", disabled: true },
    ],
  },
  { value: "general", label: "General" },
];

export const getHierarchicalPathLabel = (
  _selected: HierarchicalSelectItem,
  path: HierarchicalSelectItem[],
) => path.map((item) => item.label).join(" / ");
