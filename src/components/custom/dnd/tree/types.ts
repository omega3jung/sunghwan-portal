// components/custom/dnd/tree/types.ts
import type { UniqueIdentifier } from "@dnd-kit/core";
import type { MutableRefObject } from "react";

/**
 * =========================
 * Base Tree Types (Generic)
 * =========================
 */

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
 * =========================
 * Flattened Types (DnD)
 * =========================
 */

/**
 * Flattened item for DnD and table rendering.
 * - parentId / depth / index are UI and DnD-only fields
 */
export interface FlattenedNode<T = unknown> extends TreeNode<T> {
  parentId: UniqueIdentifier | null;
  depth: number;
  index: number;
}

/**
 * =========================
 * Sensor Context
 * =========================
 * Shared context for projection calculation during drag.
 */
export type SensorContext = MutableRefObject<{
  items: FlattenedNode[];
  offset: number;
}>;

/**
 * =========================
 * Generic Helpers
 * =========================
 */

/**
 * Utility type for attaching domain data to TreeNode.
 *
 * Example:
 * TreeNodeWithData<CategoryData>
 */
export type TreeNodeWithData<T> = T & {
  id: UniqueIdentifier;
  children?: TreeNodeWithData<T>[];
  collapsed?: boolean;
};

/**
 * FlattenedNode + domain data.
 */
export type FlattenedNodeWithData<T> = T & {
  id: UniqueIdentifier;
  parentId: UniqueIdentifier | null;
  depth: number;
  index: number;
  collapsed?: boolean;
};
