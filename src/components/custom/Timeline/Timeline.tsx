import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { NS } from "@/lib/i18n";
import { cn } from "@/shared/utils/presentation";

import { TimelineItem } from "./TimelineItem";
import type { TimelineProps } from "./types";

const Root = ({
  items,
  order = "desc",
  className,
  itemClassName,
  compact = false,
}: TimelineProps) => {
  const { t } = useTranslation();

  const sortedItems = useMemo(() => {
    if (order === "asc") {
      return items;
    }

    return [...items].reverse();
  }, [items, order]);

  if (sortedItems.length === 0) {
    return (
      <div className={cn("py-2 text-sm text-muted-foreground", className)}>
        {t("empty.withItem", { ns: NS.common, item: t("field.history") })}
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
