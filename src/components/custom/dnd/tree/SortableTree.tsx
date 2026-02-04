import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  UniqueIdentifier,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import React, { useMemo, useState } from "react";
import { createPortal } from "react-dom";

import type { FlattenedNode, TreeNodes } from "./types";
import {
  buildTree,
  flattenTree,
  getProjection,
  removeChildrenOf,
  setProperty,
} from "./utilities";

export interface SortableTreeRenderItemParams {
  onCollapse?: (id: UniqueIdentifier) => void;
}

export interface SortableTreeProps<T> {
  items: TreeNodes<T>;
  onChange(items: TreeNodes<T>): void;
  renderItem(
    item: FlattenedNode<T>,
    params: SortableTreeRenderItemParams,
  ): React.ReactNode;
  collapsible?: boolean;
  removable?: boolean;
  indentationWidth?: number;
}

export function SortableTree<T>({
  items,
  onChange,
  renderItem,
  collapsible,
  indentationWidth = 50,
}: SortableTreeProps<T>) {
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [overId, setOverId] = useState<UniqueIdentifier | null>(null);
  const [offsetLeft, setOffsetLeft] = useState(0);
  const [currentPosition, setCurrentPosition] = useState<{
    parentId: UniqueIdentifier | null;
    overId: UniqueIdentifier;
  } | null>(null);

  const flattenedItems = useMemo(() => {
    const flattened = flattenTree(items);
    const collapsedIds = flattened
      .filter((item) => item.collapsed && item.children.length)
      .map((item) => item.id);

    return removeChildrenOf(flattened, collapsedIds);
  }, [items]);

  const projected =
    activeId && overId
      ? getProjection(
          flattenedItems,
          activeId,
          overId,
          offsetLeft,
          indentationWidth,
        )
      : null;

  const sortedIds = flattenedItems.map((item) => item.id);

  const sensors = useSensors(useSensor(PointerSensor));

  function handleDragStart({ active }: DragStartEvent) {
    setActiveId(active.id);
    setOverId(active.id);
  }

  function handleDragOver({ over }: DragOverEvent) {
    setOverId(over?.id ?? null);
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    resetState();
    if (!projected || !over) return;

    const clonedItems: FlattenedNode<T>[] = JSON.parse(
      JSON.stringify(flattenTree(items)),
    );

    const activeIndex = clonedItems.findIndex((i) => i.id === active.id);
    const overIndex = clonedItems.findIndex((i) => i.id === over.id);

    const activeItem = clonedItems[activeIndex];

    // ✅ depth가 같은 경우에만 구조 변경 허용
    const allowDepthChange = projected.depth === activeItem.depth;

    const nextDepth = allowDepthChange ? projected.depth : activeItem.depth;

    const nextParentId = allowDepthChange
      ? projected.parentId
      : activeItem.parentId;

    clonedItems[activeIndex] = {
      ...activeItem,
      depth: nextDepth,
      parentId: nextParentId,
    };

    const sortedItems = arrayMove(clonedItems, activeIndex, overIndex);
    onChange(buildTree(sortedItems));
  }

  function handleCollapse(id: UniqueIdentifier) {
    const nextTree = setProperty(items, id, "collapsed", (value) => !value);

    onChange(nextTree);
  }

  function resetState() {
    setOverId(null);
    setActiveId(null);
    setOffsetLeft(0);
    setCurrentPosition(null);

    document.body.style.setProperty("cursor", "");
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={sortedIds} strategy={verticalListSortingStrategy}>
        {flattenedItems.map((item) =>
          renderItem(item, {
            onCollapse: collapsible ? handleCollapse : undefined,
          }),
        )}

        {createPortal(
          <DragOverlay>
            {activeId
              ? renderItem(flattenedItems.find((i) => i.id === activeId)!, {
                  onCollapse: collapsible ? handleCollapse : undefined,
                })
              : null}
          </DragOverlay>,
          document.body,
        )}
      </SortableContext>
    </DndContext>
  );
}
