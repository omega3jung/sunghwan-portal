import type { UniqueIdentifier } from "@dnd-kit/core";
import { type AnimateLayoutChanges, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";

import { TreeItem } from "./TreeItem";
import styles from "./TreeItem.module.css";

export interface SortableTreeItemRenderParams {
  dragHandleProps: HTMLAttributes<HTMLButtonElement>;
  isDragging: boolean;
  isSorting: boolean;
}

export interface SortableTreeItemProps
  extends Omit<ComponentPropsWithoutRef<"div">, "children" | "id"> {
  id: UniqueIdentifier;
  depth: number;
  indentationWidth: number;
  disabled?: boolean;
  children: (params: SortableTreeItemRenderParams) => ReactNode;
}

const animateLayoutChanges: AnimateLayoutChanges = ({
  isSorting,
  wasDragging,
}) => !isSorting && !wasDragging;

export function SortableTreeItem({
  id,
  depth,
  indentationWidth,
  disabled = false,
  children,
  style,
  ...itemProps
}: SortableTreeItemProps) {
  const {
    attributes,
    listeners,
    isDragging,
    isSorting,
    setDraggableNodeRef,
    setDroppableNodeRef,
    transform,
    transition,
  } = useSortable({
    id,
    disabled,
    animateLayoutChanges,
  });

  const indentationStyle = {
    "--tree-item-indentation": `${indentationWidth * depth}px`,
  } as CSSProperties;
  const transformStyle: CSSProperties = {
    ...style,
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <li
      ref={setDroppableNodeRef}
      className={styles.Wrapper}
      style={indentationStyle}
    >
      <TreeItem
        {...itemProps}
        ref={setDraggableNodeRef}
        style={transformStyle}
        ghost={isDragging}
        disableInteraction={isSorting}
      >
        {children({
          dragHandleProps: {
            ...attributes,
            ...listeners,
          },
          isDragging,
          isSorting,
        })}
      </TreeItem>
    </li>
  );
}
