import type { UniqueIdentifier } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";

import type { FlattenedNode, TreeNode, TreeNodes } from "./types";

function getDragDepth(offset: number, indentationWidth: number) {
  return Math.round(offset / indentationWidth);
}

export function getProjection<T>(
  items: FlattenedNode<T>[],
  activeId: UniqueIdentifier,
  overId: UniqueIdentifier,
  dragOffset: number,
  indentationWidth: number,
) {
  const overItemIndex = items.findIndex(({ id }) => id === overId);
  const activeItemIndex = items.findIndex(({ id }) => id === activeId);
  const activeItem = items[activeItemIndex];
  const newItems = arrayMove(items, activeItemIndex, overItemIndex);
  const previousItem = newItems[overItemIndex - 1];
  const nextItem = newItems[overItemIndex + 1];
  const dragDepth = getDragDepth(dragOffset, indentationWidth);
  const projectedDepth = activeItem.depth + dragDepth;
  const maxDepth = getMaxDepth({
    previousItem,
  });
  const minDepth = getMinDepth({ nextItem });
  let depth = projectedDepth;

  if (projectedDepth >= maxDepth) {
    depth = maxDepth;
  } else if (projectedDepth < minDepth) {
    depth = minDepth;
  }

  return { depth, maxDepth, minDepth, parentId: getParentId() };

  function getParentId() {
    if (depth === 0 || !previousItem) {
      return null;
    }

    if (depth === previousItem.depth) {
      return previousItem.parentId;
    }

    if (depth > previousItem.depth) {
      return previousItem.id;
    }

    const newParent = newItems
      .slice(0, overItemIndex)
      .reverse()
      .find((item) => item.depth === depth)?.parentId;

    return newParent ?? null;
  }
}

function getMaxDepth({ previousItem }: { previousItem: FlattenedNode }) {
  if (previousItem) {
    return previousItem.depth + 1;
  }

  return 0;
}

function getMinDepth({ nextItem }: { nextItem: FlattenedNode }) {
  if (nextItem) {
    return nextItem.depth;
  }

  return 0;
}

function flatten<T>(
  items: TreeNodes<T>,
  parentId: UniqueIdentifier | null = null,
  depth = 0,
): FlattenedNode<T>[] {
  return items.reduce<FlattenedNode<T>[]>((acc, item, index) => {
    return [
      ...acc,
      { ...item, parentId, depth, index },
      ...flatten(item.children, item.id, depth + 1),
    ];
  }, []);
}

export function flattenTree<T>(items: TreeNodes<T>): FlattenedNode<T>[] {
  return flatten(items);
}

export function buildTree<T>(flattenedItems: FlattenedNode<T>[]): TreeNodes<T> {
  const root: TreeNode<T | null> = { id: "root", children: [], data: null };
  const nodes: Record<string, TreeNode<T | null>> = { [root.id]: root };
  const items = flattenedItems.map((item) => ({ ...item, children: [] }));

  for (const item of items) {
    const parentId = item.parentId ?? root.id;
    const parent = nodes[parentId] ?? findItem(items, parentId);

    nodes[item.id] = item;
    parent.children.push(item);
  }

  return root.children as TreeNodes<T>;
}

export function findItem<T>(
  items: TreeNode<T>[],
  itemId: UniqueIdentifier,
): TreeNode<T> | undefined {
  return items.find(({ id }) => id === itemId);
}

export function findItemDeep<T>(
  items: TreeNodes<T>,
  itemId: UniqueIdentifier,
): TreeNode<T> | undefined {
  for (const item of items) {
    if (item.id === itemId) return item;
    if (item.children.length) {
      const found = findItemDeep(item.children, itemId);
      if (found) return found;
    }
  }
}

export function removeItem<T>(
  items: TreeNodes<T>,
  id: UniqueIdentifier,
): TreeNodes<T> {
  return items
    .filter((item) => item.id !== id)
    .map((item) => ({
      ...item,
      children: removeItem(item.children, id),
    }));
}

export function setProperty<TData, K extends keyof TreeNode<TData>>(
  items: TreeNodes<TData>,
  id: UniqueIdentifier,
  property: K,
  setter: (value: TreeNode<TData>[K]) => TreeNode<TData>[K],
): TreeNodes<TData> {
  for (const item of items) {
    if (item.id === id) {
      item[property] = setter(item[property]);
      continue;
    }

    if (item.children.length) {
      item.children = setProperty(item.children, id, property, setter);
    }
  }

  return [...items];
}

function countChildren<T>(items: TreeNode<T>[], count = 0): number {
  return items.reduce((acc, { children }) => {
    if (children.length) {
      return countChildren(children, acc + 1);
    }

    return acc + 1;
  }, count);
}

export function getChildCount<T>(items: TreeNodes<T>, id: UniqueIdentifier) {
  const item = findItemDeep(items, id);

  return item ? countChildren(item.children) : 0;
}

export function removeChildrenOf<T>(
  items: FlattenedNode<T>[],
  ids: UniqueIdentifier[],
) {
  const collapsedIds = new Set(ids);
  const excluded = new Set<UniqueIdentifier>();

  return items.filter((item) => {
    // already removed by parent.
    if (excluded.has(item.id)) return false;

    // if parent is collapsed, this node is exclude.
    if (
      item.parentId &&
      (collapsedIds.has(item.parentId) || excluded.has(item.parentId))
    ) {
      excluded.add(item.id);
      return false;
    }

    return true;
  });
}

export function treeToList<T>(items: TreeNodes<T>): T[] {
  return flattenTree(items).map((item) => item.data);
}

export function listToTree<T extends { id: UniqueIdentifier }>(
  items: T[],
): TreeNodes<T> {
  return items.map((item) => ({
    id: item.id,
    data: item,
    children: [],
  }));
}

export function normalizeTree<T>(
  nodes: Array<Omit<TreeNode<T>, "children"> & { children?: TreeNode<T>[] }>,
): TreeNodes<T> {
  return nodes.map((node) => ({
    ...node,
    children: normalizeTree(node.children ?? []),
  }));
}
export type TreeNodePath = number[];

const findTreeNodePathInternal = <T>(
  tree: TreeNodes<T>,
  targetId: UniqueIdentifier,
  parentPath: TreeNodePath,
): TreeNodePath | null => {
  for (let index = 0; index < tree.length; index += 1) {
    const node = tree[index];
    const currentPath = [...parentPath, index];

    if (node.id === targetId) {
      return currentPath;
    }

    const childPath = findTreeNodePathInternal(
      node.children,
      targetId,
      currentPath,
    );

    if (childPath) {
      return childPath;
    }
  }

  return null;
};

export const findTreeNodePath = <T>(
  tree: TreeNodes<T>,
  targetId: UniqueIdentifier | null,
): TreeNodePath | null => {
  if (targetId === null) {
    return null;
  }

  return findTreeNodePathInternal(tree, targetId, []);
};

export const findTreeNodeData = <T>(
  tree: TreeNodes<T>,
  targetId: UniqueIdentifier | null,
): T | null => {
  if (targetId === null) {
    return null;
  }

  return findItemDeep(tree, targetId)?.data ?? null;
};

export const resolveTreeNodeIdByPath = <T>(
  tree: TreeNodes<T>,
  path: TreeNodePath | null,
): UniqueIdentifier | null => {
  if (!path?.length) {
    return null;
  }

  let currentNodes = tree;
  let currentNode = null;

  for (const index of path) {
    currentNode = currentNodes[index] ?? null;

    if (!currentNode) {
      return null;
    }

    currentNodes = currentNode.children;
  }

  return currentNode ? currentNode.id : null;
};
