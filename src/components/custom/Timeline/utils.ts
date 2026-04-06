import { cn } from "@/shared/utils";

import {
  resolveTimelinePaletteIndex,
  timelinePalette,
  timelinePaletteAccent,
} from "./styles";
import type { TimelineItemData, TimelinePaletteIndex } from "./types";

export const getTimelinePaletteIndex = (
  item: Pick<TimelineItemData, "palette">,
  itemIndex: number,
): TimelinePaletteIndex => {
  return resolveTimelinePaletteIndex(itemIndex, item.palette);
};

export const getTimelineBadgeClassName = (
  paletteIndex: TimelinePaletteIndex,
  className?: string,
) => {
  return cn(
    "inline-flex w-fit items-center rounded-md border border-black/[0.04] px-2 py-0.5 text-[11px] font-medium leading-4 shadow-none",
    timelinePalette[paletteIndex],
    className,
  );
};

export const getTimelineAccentClassName = (
  paletteIndex: TimelinePaletteIndex,
  className?: string,
) => {
  return cn(timelinePaletteAccent[paletteIndex], className);
};
