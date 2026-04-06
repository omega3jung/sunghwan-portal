import { cn } from "@/shared/utils";

import type { TimelinePaletteIndex } from "./types";
import { getTimelineAccentClassName } from "./utils";

export type TimelineConnectorProps = {
  paletteIndex: TimelinePaletteIndex;
  className?: string;
};

export const TimelineConnector = ({
  paletteIndex,
  className,
}: TimelineConnectorProps) => {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "w-px flex-1 rounded-full opacity-55",
        getTimelineAccentClassName(paletteIndex),
        className,
      )}
    />
  );
};
