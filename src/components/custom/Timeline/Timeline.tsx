import { useMemo } from "react";

import { cn } from "@/shared/utils/presentation";

import { TimelineItem } from "./TimelineItem";
import type { TimelineProps } from "./types";

const Root = ({
  items,
  emptyContent,
  order = "desc",
  className,
  itemClassName,
  compact = false,
}: TimelineProps) => {
  const sortedItems = useMemo(() => {
    if (order === "asc") {
      return items;
    }

    return [...items].reverse();
  }, [items, order]);

  if (sortedItems.length === 0) {
    return (
      <div className={cn("py-2 text-sm text-muted-foreground", className)}>
        {emptyContent}
      </div>
    );
  }

  return (
    <ol className={cn("flex flex-col", className)}>
      {sortedItems.map((item, index) => (
        <TimelineItem
          className={itemClassName}
          compact={compact}
          index={index}
          isLast={index === sortedItems.length - 1}
          item={item}
          key={item.id}
        />
      ))}
    </ol>
  );
};

export const Timeline = Object.assign(Root, {});
