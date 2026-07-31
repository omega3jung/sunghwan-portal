import type { UniqueIdentifier } from "@dnd-kit/core";

/**
 * Minimal tree item interface.
 * - Domain-agnostic
 */
export interface TreeNode<T = unknown> {
  id: UniqueIdentifier;
  children: TreeNode<T>[];
  collapsed?: boolean;
  maximum?: number;
  data: T;
}

/**
 * Full tree structure.
 */
export type TreeNodes<T = unknown> = TreeNode<T>[];

/**
 * Flattened item for DnD and table rendering.
 * - parentId / depth / index are UI and DnD-only fields
 */
export interface FlattenedNode<T = unknown> extends TreeNode<T> {
  parentId: UniqueIdentifier | null;
  depth: number;
  index: number;
}
