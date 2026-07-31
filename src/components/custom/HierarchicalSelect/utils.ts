import type { HierarchicalSelectItem } from "./types";

export const findItemPath = (
  items: HierarchicalSelectItem[],
  targetValue: string,
  path: HierarchicalSelectItem[] = [],
): HierarchicalSelectItem[] => {
  for (const item of items) {
    const nextPath = [...path, item];

    if (item.value === targetValue) {
      return nextPath;
    }

    const childPath = findItemPath(item.children ?? [], targetValue, nextPath);

    if (childPath.length > 0) {
      return childPath;
    }
  }

  return [];
};

export const createItemPathMap = (
  items: HierarchicalSelectItem[],
  path: HierarchicalSelectItem[] = [],
  itemPathMap = new Map<string, HierarchicalSelectItem[]>(),
) => {
  for (const item of items) {
    const nextPath = [...path, item];

    itemPathMap.set(item.value, nextPath);
    createItemPathMap(item.children ?? [], nextPath, itemPathMap);
  }

  return itemPathMap;
};
