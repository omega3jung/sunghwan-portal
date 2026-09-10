import type { TimelineItemData } from "@/components/custom/Timeline";

type TimelineFixture = Pick<TimelineItemData, "id" | "palette">;

/** Structural timeline fixtures; user-facing copy is owned by Storybook locales. */
export const timelineItems: TimelineFixture[] = [
  { id: "career-2016-bkit", palette: 7 },
  { id: "career-2019-cynergy", palette: 2 },
  { id: "project-2022-mobileklink", palette: 4 },
];
