"use client";

import {
  closestCenter,
  type CollisionDetection,
  DndContext,
  type DragEndEvent,
  type DragMoveEvent,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  type UniqueIdentifier,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  type HTMLAttributes,
  type ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createPortal } from "react-dom";

import { cn } from "@/shared/utils/presentation";

import {
  SortableTreeItem,
  type SortableTreeItemRenderParams,
  TreeItem,
} from "./TreeItem";
import type { FlattenedNode, TreeNodes } from "./types";
import {
  buildTree,
  flattenTree,
  getProjection,
  removeChildrenOf,
  setProperty,
} from "./utilities";

export type SortableTreeReorderScope = "tree" | "sameDepth" | "siblings";

const VERTICAL_REORDER_MODIFIERS = [restrictToVerticalAxis];

export interface SortableTreeRenderItemParams
  extends SortableTreeItemRenderParams {
  isOverlay: boolean;
  onCollapse?: (id: UniqueIdentifier) => void;
}

export interface SortableTreeProps<T> {
  items: TreeNodes<T>;
  onChange(items: TreeNodes<T>): void;
  renderItem(
    item: FlattenedNode<T>,
    params: SortableTreeRenderItemParams,
  ): ReactNode;
  collapsible?: boolean;
  disabled?: boolean;
  indentationWidth?: number;
  listClassName?: string;
  reorderScope?: SortableTreeReorderScope;
}

export function SortableTree<T>({
  items,
  onChange,
  renderItem,
  collapsible = false,
  disabled = false,
  indentationWidth = 20,
  listClassName,
  reorderScope = "tree",
}: SortableTreeProps<T>) {
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [overId, setOverId] = useState<UniqueIdentifier | null>(null);
  const [offsetLeft, setOffsetLeft] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const allFlattenedItems = useMemo(() => flattenTree(items), [items]);
  const flattenedItemsById = useMemo(
    () => new Map(allFlattenedItems.map((item) => [item.id, item])),
    [allFlattenedItems],
  );
  const flattenedItems = useMemo(() => {
    const collapsedIds = allFlattenedItems
      .filter((item) => item.collapsed && item.children.length > 0)
      .map((item) => item.id);
    const excludedParentIds =
      activeId === null ? collapsedIds : [...collapsedIds, activeId];

    return removeChildrenOf(allFlattenedItems, excludedParentIds);
  }, [activeId, allFlattenedItems]);

  const activeItem =
    activeId === null
      ? undefined
      : flattenedItemsById.get(activeId);
  const overItem =
    overId === null ? undefined : flattenedItemsById.get(overId);
  const projected =
    activeId !== null &&
    overId !== null &&
    activeItem &&
    overItem &&
    isWithinReorderScope(activeItem, overItem, reorderScope)
      ? reorderScope === "tree"
        ? getProjection(
            flattenedItems,
            activeId,
            overId,
            offsetLeft,
            indentationWidth,
          )
        : {
            depth: activeItem.depth,
            parentId:
              reorderScope === "siblings"
                ? activeItem.parentId
                : overItem.parentId,
          }
      : null;
  const sortedIds = flattenedItems.map((item) => item.id);
  const collisionDetection = useMemo<CollisionDetection>(
    () => (args) => {
      if (reorderScope === "tree") {
        return closestCenter(args);
      }

      const activeTreeItem = flattenedItemsById.get(args.active.id);

      if (!activeTreeItem) {
        return [];
      }

      const droppableContainers = args.droppableContainers.filter(
        (container) => {
          const candidate = flattenedItemsById.get(container.id);

          return (
            candidate !== undefined &&
            isWithinReorderScope(
              activeTreeItem,
              candidate,
              reorderScope,
            )
          );
        },
      );

      return closestCenter({ ...args, droppableContainers });
    },
    [flattenedItemsById, reorderScope],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 4,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragStart({ active }: DragStartEvent) {
    setActiveId(active.id);
    setOverId(active.id);
  }

  function handleDragMove({ delta }: DragMoveEvent) {
    setOffsetLeft(reorderScope === "tree" ? delta.x : 0);
  }

  function handleDragOver({ over }: DragOverEvent) {
    setOverId(over?.id ?? null);
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!projected || !over) {
      resetState();
      return;
    }

    const activeIndex = allFlattenedItems.findIndex(
      (item) => item.id === active.id,
    );
    const overIndex = allFlattenedItems.findIndex(
      (item) => item.id === over.id,
    );

    if (activeIndex < 0 || overIndex < 0) {
      resetState();
      return;
    }

    const activeTreeItem = allFlattenedItems[activeIndex];
    const overTreeItem = allFlattenedItems[overIndex];

    if (
      !isWithinReorderScope(activeTreeItem, overTreeItem, reorderScope)
    ) {
      resetState();
      return;
    }

    const nextParent = allFlattenedItems.find(
      (item) => item.id === projected.parentId,
    );
    const siblingCount = allFlattenedItems.filter(
      (item) =>
        item.parentId === projected.parentId && item.id !== active.id,
    ).length;

    if (nextParent?.maximum != null && siblingCount >= nextParent.maximum) {
      resetState();
      return;
    }

    const reorderedItem: FlattenedNode<T> = {
      ...activeTreeItem,
      depth: projected.depth,
      parentId: projected.parentId,
    };
    const nextItems = [...allFlattenedItems];
    nextItems[activeIndex] = reorderedItem;

    onChange(buildTree(arrayMove(nextItems, activeIndex, overIndex)));
    resetState();
  }

  function handleCollapse(id: UniqueIdentifier) {
    onChange(setProperty(items, id, "collapsed", (value) => !value));
  }

  function resetState() {
    setOverId(null);
    setActiveId(null);
    setOffsetLeft(0);
  }

  const overlayParams: SortableTreeRenderItemParams = {
    dragHandleProps: {} as HTMLAttributes<HTMLButtonElement>,
    isDragging: true,
    isSorting: true,
    isOverlay: true,
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      modifiers={
        reorderScope === "tree" ? undefined : VERTICAL_REORDER_MODIFIERS
      }
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={resetState}
    >
      <SortableContext items={sortedIds} strategy={verticalListSortingStrategy}>
        <ul
          className={cn("m-0 block h-fit w-full min-w-0 p-0", listClassName)}
        >
          {flattenedItems.map((item) => (
            <SortableTreeItem
              key={item.id}
              id={item.id}
              depth={item.depth}
              indentationWidth={indentationWidth}
              disabled={disabled}
            >
              {(sortableParams) =>
                renderItem(item, {
                  ...sortableParams,
                  isOverlay: false,
                  onCollapse: collapsible ? handleCollapse : undefined,
                })
              }
            </SortableTreeItem>
          ))}
        </ul>
      </SortableContext>

      {isMounted &&
        createPortal(
          <DragOverlay>
            {activeItem ? (
              <TreeItem clone>
                {renderItem(activeItem, overlayParams)}
              </TreeItem>
            ) : null}
          </DragOverlay>,
          document.body,
        )}
    </DndContext>
  );
}

function isWithinReorderScope(
  activeItem: FlattenedNode,
  overItem: FlattenedNode,
  reorderScope: SortableTreeReorderScope,
) {
  switch (reorderScope) {
    case "sameDepth":
      return activeItem.depth === overItem.depth;
    case "siblings":
      return activeItem.parentId === overItem.parentId;
    case "tree":
      return true;
  }
}
