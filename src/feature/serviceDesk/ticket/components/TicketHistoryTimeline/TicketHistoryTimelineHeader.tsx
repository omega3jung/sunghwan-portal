import { ClockArrowDown, ClockArrowUp } from "lucide-react";

import type { TimelineOrder } from "@/components/custom/Timeline";
import { Toggle } from "@/components/ui/toggle";

type TicketHistoryTimelineHeaderProps = {
  order: TimelineOrder;
  onOrderChange: (order: TimelineOrder) => void;
};

export function TicketHistoryTimelineHeader({
  order,
  onOrderChange,
}: TicketHistoryTimelineHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-sm font-semibold text-primary">Ticket History</h2>
        <p className="text-xs text-muted-foreground">
          Timeline view for recent ticket activity.
        </p>
      </div>

      <Toggle
        aria-label="Toggle timeline order"
        size="sm"
        pressed={order === "asc"}
        onPressedChange={(pressed) => onOrderChange(pressed ? "asc" : "desc")}
      >
        {order === "desc" ? (
          <ClockArrowDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ClockArrowUp className="h-4 w-4 text-muted-foreground" />
        )}
      </Toggle>
    </div>
  );
}
