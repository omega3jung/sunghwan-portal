import type { ReactNode } from "react";

import { cn } from "@/shared/utils";

import type { TimelinePaletteIndex } from "./types";
import { getTimelineAccentClassName } from "./utils";

export type TimelineMarkerProps = {
  paletteIndex: TimelinePaletteIndex;
  markerIcon?: ReactNode;
  className?: string;
};

export const TimelineMarker = ({
  paletteIndex,
  markerIcon,
  className,
}: TimelineMarkerProps) => {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-background text-[11px] text-foreground/80 shadow-sm [&_svg]:h-3 [&_svg]:w-3",
        getTimelineAccentClassName(paletteIndex),
        className,
      )}
    >
      {markerIcon}
    </div>
  );
};
