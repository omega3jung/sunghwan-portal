import type { ReactNode } from "react";

export type TimelinePaletteIndex = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export type TimelineOrder = "asc" | "desc";

export type TimelineItemData = {
  id: string;
  title: string;
  description?: string;
  meta?: string;
  badge?: string;
  palette?: TimelinePaletteIndex;
  markerIcon?: ReactNode;
};

export type TimelineProps = {
  items: TimelineItemData[];
  order?: TimelineOrder; // default: "desc"
  className?: string;
  itemClassName?: string;
  compact?: boolean;
};
