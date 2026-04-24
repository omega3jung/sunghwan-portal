import type { UniqueIdentifier } from "@dnd-kit/core";

import type { TreeNodes } from "@/components/custom/dnd/tree/types";

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

  for (const node of tree) {
    if (node.id === targetId) {
      return node.data;
    }

    const childData = findTreeNodeData(node.children, targetId);

    if (childData !== null) {
      return childData;
    }
  }

  return null;
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
