import type { TFunction } from "i18next";

import type { HierarchicalSelectItem } from "@/components/custom/HierarchicalSelect";

export const hierarchicalItems: HierarchicalSelectItem[] = [
  {
    value: "portal",
    label: "portal",
    children: [
      {
        value: "portal-account",
        label: "account",
        children: [
          { value: "portal-account-login", label: "login" },
          { value: "portal-account-profile", label: "profile" },
        ],
      },
      {
        value: "portal-notification",
        label: "notification",
        children: [
          { value: "portal-notification-email", label: "email" },
          { value: "portal-notification-push", label: "push" },
        ],
      },
    ],
  },
  {
    value: "operations",
    label: "operations",
    children: [
      { value: "operations-approval", label: "approval" },
      { value: "operations-assignment", label: "assignment" },
      {
        value: "operations-reporting",
        label: "reporting",
        disabled: true,
      },
    ],
  },
  { value: "general", label: "general" },
];

export function localizeHierarchicalItems(
  items: HierarchicalSelectItem[],
  t: TFunction,
): HierarchicalSelectItem[] {
  return items.map((item) => ({
    ...item,
    label: t(`items.${item.label}`, { defaultValue: item.label }),
    children: item.children
      ? localizeHierarchicalItems(item.children, t)
      : undefined,
  }));
}

export const getHierarchicalPathLabel = (
  _selected: HierarchicalSelectItem,
  path: HierarchicalSelectItem[],
) => path.map((item) => item.label).join(" / ");
