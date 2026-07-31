import type { HierarchicalSelectItem } from "@/components/custom/HierarchicalSelect";

type HierarchySourceItem = {
  id: string;
  label: string;
  parentId?: string;
};

export function buildHierarchicalSelectItems(
  sourceItems: readonly HierarchySourceItem[],
  fallbackValue?: string,
): HierarchicalSelectItem[] {
  const sourceById = new Map(sourceItems.map((item) => [item.id, item]));
  const itemById = new Map<string, HierarchicalSelectItem>(
    sourceItems.map((item) => [
      item.id,
      {
        value: item.id,
        label: item.label,
        children: [],
      },
    ]),
  );
  const rootItems: HierarchicalSelectItem[] = [];

  for (const sourceItem of sourceItems) {
    const item = itemById.get(sourceItem.id);

    if (!item) {
      continue;
    }

    const parentId = sourceItem.parentId;
    const parent = parentId ? itemById.get(parentId) : undefined;

    if (
      parentId &&
      parent &&
      parentId !== "0" &&
      parentId !== sourceItem.id &&
      !createsCycle(sourceItem.id, parentId, sourceById)
    ) {
      parent.children?.push(item);
    } else {
      rootItems.push(item);
    }
  }

  if (fallbackValue && !itemById.has(fallbackValue)) {
    rootItems.push({
      value: fallbackValue,
      label: fallbackValue,
    });
  }

  return rootItems;
}

function createsCycle(
  itemId: string,
  parentId: string,
  sourceById: ReadonlyMap<string, HierarchySourceItem>,
) {
  const visited = new Set<string>();
  let currentId: string | undefined = parentId;

  while (currentId && currentId !== "0") {
    if (currentId === itemId || visited.has(currentId)) {
      return true;
    }

    visited.add(currentId);
    currentId = sourceById.get(currentId)?.parentId;
  }

  return false;
}
