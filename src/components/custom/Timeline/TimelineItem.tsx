import { cn } from "@/shared/utils";

import { TimelineConnector } from "./TimelineConnector";
import { TimelineMarker } from "./TimelineMarker";
import type { TimelineItemData } from "./types";
import { getTimelineBadgeClassName, getTimelinePaletteIndex } from "./utils";

export type TimelineItemProps = {
  item: TimelineItemData;
  index: number;
  isLast: boolean;
  compact?: boolean;
  className?: string;
};

export const TimelineItem = ({
  item,
  index,
  isLast,
  compact = false,
  className,
}: TimelineItemProps) => {
  const paletteIndex = getTimelinePaletteIndex(item, index);

  return (
    <li className={cn("flex gap-3", className)}>
      <div className="flex w-6 shrink-0 flex-col items-center self-stretch">
        <TimelineMarker
          className={cn(
            compact ? "h-5 w-5 [&_svg]:h-2.5 [&_svg]:w-2.5" : "h-6 w-6",
          )}
          markerIcon={item.markerIcon}
          paletteIndex={paletteIndex}
        />
        {!isLast ? (
          <TimelineConnector
            className={cn(compact ? "mt-1 min-h-6" : "mt-1.5 min-h-8")}
            paletteIndex={paletteIndex}
          />
        ) : null}
      </div>

      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col",
          compact ? "gap-1 pb-4" : "gap-1.5 pb-6",
        )}
      >
        {item.badge ? (
          <span className={getTimelineBadgeClassName(paletteIndex)}>
            {item.badge}
          </span>
        ) : null}

        <p
          className={cn(
            "break-words font-medium text-foreground",
            compact ? "text-sm leading-5" : "text-sm leading-5",
          )}
        >
          {item.title}
        </p>

        {item.description ? (
          <p
            className={cn(
              "break-words text-muted-foreground",
              compact ? "text-xs leading-5" : "text-sm leading-6",
            )}
          >
            {item.description}
          </p>
        ) : null}

        {item.meta ? (
          <p
            className={cn(
              "break-words text-muted-foreground/90",
              compact ? "text-[11px] leading-4" : "text-xs leading-5",
            )}
          >
            {item.meta}
          </p>
        ) : null}
      </div>
    </li>
  );
};
