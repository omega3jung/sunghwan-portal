import type { UniqueIdentifier } from "@dnd-kit/core";

export interface TreeNode<T = unknown> {
  id: UniqueIdentifier;
  children: TreeNode<T>[];
  collapsed?: boolean;
  /** Maximum number of direct children accepted during a drop. */
  maximum?: number;
  data: T;
}

export type TreeNodes<T = unknown> = TreeNode<T>[];

/** `parentId`, `depth`, and `index` exist only in the drag projection. */
export interface FlattenedNode<T = unknown> extends TreeNode<T> {
  parentId: UniqueIdentifier | null;
  depth: number;
  index: number;
}
