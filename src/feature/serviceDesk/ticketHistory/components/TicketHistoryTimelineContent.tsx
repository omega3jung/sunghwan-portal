"use client";

import { ClockArrowDown, ClockArrowUp } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import {
  Timeline,
  type TimelineItemData,
  type TimelineOrder,
} from "@/components/custom/Timeline";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Toggle } from "@/components/ui/toggle";
import type { TicketHistory } from "@/domain/serviceDesk";
import { NS } from "@/lib/application/i18n";
import { cn } from "@/shared/utils/presentation";

import { mapTicketHistoryToTimelineItem } from "../mapper";

type TicketHistoryTimelineContentProps = {
  items?: TicketHistory[];
  isLoading?: boolean;
  order: TimelineOrder;
  onOrderChange: (order: TimelineOrder) => void;
  compact?: boolean;
  showSortAction?: boolean;
  className?: string;
};

export function TicketHistoryTimelineContent({
  items,
  isLoading = false,
  order,
  onOrderChange,
  compact = true,
  showSortAction = true,
  className,
}: TicketHistoryTimelineContentProps) {
  const { t } = useTranslation(NS.serviceDesk);
  const { t: tCommon } = useTranslation(NS.common);
  const { t: tHistory } = useTranslation(NS.serviceDesk, {
    keyPrefix: "recentActivity",
  });
  const { t: tStatus } = useTranslation("StatusBadge");

  const mappedItems = useMemo<TimelineItemData[]>(() => {
    const resolvedItems = items?.length ? items : [];

    return resolvedItems.map((item) =>
      mapTicketHistoryToTimelineItem(item, { t, tCommon, tHistory, tStatus }),
    );
  }, [items, t, tCommon, tHistory, tStatus]);

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col", className)}>
      <div className="min-h-0 flex-1">
        <ScrollArea className="h-full">
          <div className="relative flex min-h-full flex-col">
            {showSortAction ? (
              <div className="pointer-events-none sticky top-0 z-10 h-0">
                <div className="absolute right-2 top-2 pointer-events-auto">
                  <Toggle
                    aria-label={t(
                      order === "desc" ? "sort.oldest" : "sort.latest",
                      { ns: NS.common },
                    )}
                    size="sm"
                    pressed={order === "asc"}
                    onPressedChange={(pressed) =>
                      onOrderChange(pressed ? "asc" : "desc")
                    }
                  >
                    {order === "desc" ? (
                      <ClockArrowDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ClockArrowUp className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Toggle>
                </div>
              </div>
            ) : null}

            <div className="px-4 pb-4 pt-4">
              {isLoading ? (
                <TicketHistoryTimelineSkeleton />
              ) : (
                <Timeline compact={compact} items={mappedItems} order={order} />
              )}
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

function TicketHistoryTimelineSkeleton() {
  const skeletonCount = 3;

  return (
    <div className="flex flex-col gap-5">
      {Array.from({ length: skeletonCount }).map((_, index) => (
        <div className="flex gap-3" key={index}>
          <div className="flex flex-col items-center">
            <Skeleton className="mt-1 h-6 w-6 rounded-full" />
            {index < 2 ? (
              <Skeleton className="mt-2 h-20 w-px rounded-full" />
            ) : null}
          </div>
          <div className="flex-1 space-y-3 pb-1">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-full max-w-[180px]" />
          </div>
        </div>
      ))}
    </div>
  );
}
