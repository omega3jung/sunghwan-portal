import type { ReactNode } from "react";

import type { MenuItem } from "@/feature/navigation/leftMenu";

import type {
  NavigationBreadcrumbDropdownItem,
  NavigationBreadcrumbItem,
} from "../types";

export type LeftMenuBreadcrumbSource = {
  content: MenuItem[];
  footer: MenuItem[];
};

type BuildBreadcrumbItemsFromLeftMenuOptions = {
  fallbackItems: NavigationBreadcrumbItem[];
  leftMenu: LeftMenuBreadcrumbSource;
  pathname: string;
  resolveLabel: (item: MenuItem) => ReactNode;
};

type MenuEntry = {
  chain: MenuItem[];
  depth: number;
  item: MenuItem;
  order: number;
  siblings: MenuItem[];
};

type MenuMatch = {
  entry: MenuEntry;
  type: "exact" | "prefix";
};

function stripQueryAndHash(path: string) {
  return path.split(/[?#]/)[0] || "/";
}

function normalizePath(path: string) {
  const normalizedPath = stripQueryAndHash(path).replace(/\/+$/, "");

  return normalizedPath.length === 0 ? "/" : normalizedPath;
}

function isHashRoute(path: string) {
  return path.includes("#");
}

function isMatchablePath(path: string | null | undefined) {
  return typeof path === "string" && path.trim().length > 0 && !isHashRoute(path);
}

function isExactMatch(pathname: string, item: MenuItem) {
  if (!isMatchablePath(item.path)) {
    return false;
  }

  return normalizePath(item.path) === pathname;
}

function isPrefixMatch(pathname: string, item: MenuItem) {
  if (!isMatchablePath(item.path)) {
    return false;
  }

  const itemPath = normalizePath(item.path);

  if (itemPath === "/" || itemPath === pathname) {
    return false;
  }

  return pathname.startsWith(`${itemPath}/`);
}

function getPathScore(item: MenuItem) {
  return normalizePath(item.path).length;
}

function isBetterEntry(candidate: MenuEntry, current: MenuEntry) {
  if (candidate.depth !== current.depth) {
    return candidate.depth > current.depth;
  }

  if (getPathScore(candidate.item) !== getPathScore(current.item)) {
    return getPathScore(candidate.item) > getPathScore(current.item);
  }

  if (candidate.item.type !== current.item.type) {
    return candidate.item.type === "PAGE";
  }

  return candidate.order < current.order;
}

function pickBestEntry(entries: MenuEntry[]) {
  return entries.reduce<MenuEntry | null>((best, entry) => {
    if (best == null) {
      return entry;
    }

    return isBetterEntry(entry, best) ? entry : best;
  }, null);
}

function flattenMenuTree(topLevelItems: MenuItem[]) {
  const entries: MenuEntry[] = [];

  const visit = (
    items: MenuItem[],
    parentChain: MenuItem[],
    siblings: MenuItem[],
  ) => {
    for (const item of items) {
      const chain = [...parentChain, item];

      entries.push({
        chain,
        depth: chain.length - 1,
        item,
        order: entries.length,
        siblings,
      });

      if (item.children?.length) {
        visit(item.children, chain, item.children);
      }
    }
  };

  visit(topLevelItems, [], topLevelItems);

  return entries;
}

function findMenuMatch(topLevelItems: MenuItem[], pathname: string): MenuMatch | null {
  const entries = flattenMenuTree(topLevelItems);
  const exactMatch = pickBestEntry(
    entries.filter((entry) => isExactMatch(pathname, entry.item)),
  );

  if (exactMatch != null) {
    return {
      entry: exactMatch,
      type: "exact",
    };
  }

  const prefixMatch = pickBestEntry(
    entries.filter((entry) => isPrefixMatch(pathname, entry.item)),
  );

  if (prefixMatch != null) {
    return {
      entry: prefixMatch,
      type: "prefix",
    };
  }

  return null;
}

function buildDropdownItems({
  currentItem,
  resolveLabel,
  siblings,
}: {
  currentItem: MenuItem;
  resolveLabel: (item: MenuItem) => ReactNode;
  siblings: MenuItem[];
}): NavigationBreadcrumbDropdownItem[] | undefined {
  const dropdownItems = siblings
    .filter((item) => typeof item.path === "string" && item.path.trim().length > 0)
    .map((item) => ({
      id: item.id,
      label: resolveLabel(item),
      href: item.path,
      disabled: item.id === currentItem.id,
    }));

  return dropdownItems.length > 1 ? dropdownItems : undefined;
}

function buildMenuBreadcrumbItems({
  match,
  resolveLabel,
  topLevelItems,
}: {
  match: MenuMatch;
  resolveLabel: (item: MenuItem) => ReactNode;
  topLevelItems: MenuItem[];
}): NavigationBreadcrumbItem[] {
  return match.entry.chain.map((item, index) => {
    const previousItem = match.entry.chain[index - 1];
    const siblings = previousItem?.children ?? topLevelItems;

    return {
      label: resolveLabel(item),
      href: item.path,
      dropdownItems: buildDropdownItems({
        currentItem: item,
        resolveLabel,
        siblings,
      }),
    };
  });
}

function getFallbackItemsAfterMatch({
  fallbackItems,
  matchedPath,
}: {
  fallbackItems: NavigationBreadcrumbItem[];
  matchedPath: string;
}) {
  const normalizedMatchedPath = normalizePath(matchedPath);
  const matchedFallbackIndex = fallbackItems.findIndex((item) => {
    if (item.href == null) {
      return false;
    }

    return normalizePath(item.href) === normalizedMatchedPath;
  });

  if (matchedFallbackIndex >= 0) {
    return fallbackItems.slice(matchedFallbackIndex + 1);
  }

  const lastFallbackItem = fallbackItems.at(-1);

  return lastFallbackItem == null ? [] : [lastFallbackItem];
}

export function buildBreadcrumbItemsFromLeftMenu({
  fallbackItems,
  leftMenu,
  pathname,
  resolveLabel,
}: BuildBreadcrumbItemsFromLeftMenuOptions): NavigationBreadcrumbItem[] | null {
  const topLevelItems = [...leftMenu.content, ...leftMenu.footer];

  if (topLevelItems.length === 0) {
    return null;
  }

  const normalizedPathname = normalizePath(pathname);
  const match = findMenuMatch(topLevelItems, normalizedPathname);

  if (match == null) {
    return null;
  }

  const menuBreadcrumbItems = buildMenuBreadcrumbItems({
    match,
    resolveLabel,
    topLevelItems,
  });

  if (match.type === "exact") {
    return menuBreadcrumbItems;
  }

  return [
    ...menuBreadcrumbItems,
    ...getFallbackItemsAfterMatch({
      fallbackItems,
      matchedPath: match.entry.item.path,
    }),
  ];
}
