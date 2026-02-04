// components/custom/dnd/tree/types.ts
import type { UniqueIdentifier } from "@dnd-kit/core";
import type { MutableRefObject } from "react";

/**
 * =========================
 * Base Tree Types (Generic)
 * =========================
 */

/**
 * 최소 Tree Item 인터페이스
 * - 도메인과 무관
 */
export interface TreeNode<T = unknown> {
  id: UniqueIdentifier;
  children: TreeNode<T>[];
  collapsed?: boolean;
  data: T;
}

/**
 * Tree 구조 전체
 */
export type TreeNodes<T = unknown> = TreeNode<T>[];

/**
 * =========================
 * Flattened Types (DnD)
 * =========================
 */

/**
 * DnD / Table 렌더링용 Flattened Item
 * - parentId / depth / index는 UI & DnD 전용
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
 * drag 중 projection 계산을 위한 공유 컨텍스트
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
 * TreeNode에 도메인 데이터를 얹기 위한 유틸 타입
 *
 * 예:
 * TreeNodeWithData<CategoryData>
 */
export type TreeNodeWithData<T> = T & {
  id: UniqueIdentifier;
  children?: TreeNodeWithData<T>[];
  collapsed?: boolean;
};

/**
 * FlattenedNode + 도메인 데이터
 */
export type FlattenedNodeWithData<T> = T & {
  id: UniqueIdentifier;
  parentId: UniqueIdentifier | null;
  depth: number;
  index: number;
  collapsed?: boolean;
};
