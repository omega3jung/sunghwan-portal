import type { UniqueIdentifier } from "@dnd-kit/core";
import { AnimateLayoutChanges, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import React, { CSSProperties } from "react";

import { TreeItem, TreeItemProps } from "./TreeItem";

export interface SortableTreeItemProps extends Omit<TreeItemProps, "children"> {
  id: UniqueIdentifier;

  children: (params: {
    dragHandleProps: React.HTMLAttributes<HTMLElement>;
    isDragging: boolean;
    isSorting: boolean;
  }) => React.ReactNode;
}

const animateLayoutChanges: AnimateLayoutChanges = ({
  isSorting,
  wasDragging,
}) => (isSorting || wasDragging ? false : true);

export function SortableTreeItem({
  id,
  children,
  ...props
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
    animateLayoutChanges,
  });

  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <TreeItem
      ref={setDraggableNodeRef}
      wrapperRef={setDroppableNodeRef}
      style={style}
      ghost={isDragging}
      disableInteraction={isSorting}
      {...props}
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
  );
}
