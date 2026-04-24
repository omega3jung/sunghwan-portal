"use client";

import { useState } from "react";

import { type TimelineOrder } from "@/components/custom/Timeline";
import type { TicketHistory } from "@/domain/serviceDesk";
import { cn } from "@/shared/utils";

import { TicketHistoryTimelineContent } from "./TicketHistoryTimelineContent";
import { TicketHistoryTimelineHeader } from "./TicketHistoryTimelineHeader";

type TicketHistoryTimelineProps = {
  items?: TicketHistory[];
  isLoading?: boolean;
  order?: TimelineOrder;
  compact?: boolean;
  showHeader?: boolean;
  showSortAction?: boolean;
  className?: string;
};

export function TicketHistoryTimeline({
  items,
  isLoading = false,
  order: defaultOrder = "desc",
  compact = true,
  showHeader = true,
  showSortAction = true,
  className,
}: TicketHistoryTimelineProps) {
  const [order, setOrder] = useState<TimelineOrder>(defaultOrder);

  return (
    <div
      className={cn("flex h-full min-h-0 flex-col bg-background", className)}
    >
      {showHeader ? (
        <div className="border-b border-primary-muted px-4 py-3">
          <TicketHistoryTimelineHeader />
        </div>
      ) : null}
      <TicketHistoryTimelineContent
        compact={compact}
        isLoading={isLoading}
        items={items}
        onOrderChange={setOrder}
        order={order}
        showSortAction={showSortAction}
      />
    </div>
  );
}
