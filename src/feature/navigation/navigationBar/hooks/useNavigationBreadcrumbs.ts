import { type ReactNode, useMemo } from "react";

import { useLocalizedText } from "@/lib/client/i18n";

import type { NavigationBreadcrumbItem } from "../types";
import type { LeftMenuBreadcrumbSource } from "../utils/buildBreadcrumbItemsFromLeftMenu";
import { buildBreadcrumbItemsFromLeftMenu } from "../utils/buildBreadcrumbItemsFromLeftMenu";

type UseNavigationBreadcrumbsParams = {
  currentLabel?: ReactNode | null;
  currentLabelPathname?: string | null;
  enabled?: boolean;
  fallbackItems: NavigationBreadcrumbItem[];
  leftMenu?: LeftMenuBreadcrumbSource | null;
  pathname: string;
};

function applyCurrentLabelOverride({
  currentLabel,
  currentLabelPathname,
  items,
  pathname,
}: Pick<
  UseNavigationBreadcrumbsParams,
  "currentLabel" | "currentLabelPathname" | "pathname"
> & {
  items: NavigationBreadcrumbItem[];
}) {
  if (
    currentLabel == null ||
    currentLabelPathname !== pathname ||
    items.length === 0
  ) {
    return items;
  }

  return items.map((item, index) =>
    index === items.length - 1 ? { ...item, label: currentLabel } : item,
  );
}

export function useNavigationBreadcrumbs({
  currentLabel,
  currentLabelPathname,
  enabled = true,
  fallbackItems,
  leftMenu,
  pathname,
}: UseNavigationBreadcrumbsParams) {
  const resolveMenuLabel = useLocalizedText();

  return useMemo(() => {
    const leftMenuItems =
      enabled && leftMenu != null
        ? buildBreadcrumbItemsFromLeftMenu({
            fallbackItems,
            leftMenu,
            pathname,
            resolveLabel: (item) => resolveMenuLabel(item.title),
          })
        : null;

    return applyCurrentLabelOverride({
      currentLabel,
      currentLabelPathname,
      items: leftMenuItems ?? fallbackItems,
      pathname,
    });
  }, [
    currentLabel,
    currentLabelPathname,
    enabled,
    fallbackItems,
    leftMenu,
    pathname,
    resolveMenuLabel,
  ]);
}
