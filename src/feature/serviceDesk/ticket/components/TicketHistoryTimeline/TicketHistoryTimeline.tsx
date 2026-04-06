"use client";

import { useMemo, useState } from "react";

import {
  Timeline,
  type TimelineItemData,
  type TimelineOrder,
} from "@/components/custom/Timeline";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { TicketHistory } from "@/domain/serviceDesk";
import { cn } from "@/shared/utils";

import { mapTicketHistoryToTimelineItem } from "./mapper";
import { mockHistoryItems } from "./mock";
import { TicketHistoryTimelineHeader } from "./TicketHistoryTimelineHeader";

type TicketHistoryTimelineProps = {
  items?: TicketHistory[];
  order?: TimelineOrder;
  compact?: boolean;
  className?: string;
};

export function TicketHistoryTimeline({
  items,
  order: defaultOrder = "desc",
  compact = true,
  className,
}: TicketHistoryTimelineProps) {
  const [order, setOrder] = useState<TimelineOrder>(defaultOrder);

  const mappedItems = useMemo<TimelineItemData[]>(() => {
    const resolvedItems = items?.length ? items : mockHistoryItems;

    return resolvedItems.map(mapTicketHistoryToTimelineItem);
  }, [items]);

  return (
    <div
      className={cn("flex h-full min-h-0 flex-col bg-background", className)}
    >
      <div className="border-b border-primary-muted px-4 py-3">
        <TicketHistoryTimelineHeader order={order} onOrderChange={setOrder} />
      </div>
      <div className="min-h-0 flex-1">
        <ScrollArea className="h-full">
          <div className="p-4">
            <Timeline compact={compact} items={mappedItems} order={order} />
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
