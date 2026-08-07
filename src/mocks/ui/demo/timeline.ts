import type { TimelineItemData } from "@/components/custom/Timeline";

type TimelineDemoFixture = Pick<TimelineItemData, "id" | "palette">;

/** Structural timeline fixtures; user-facing copy is owned by the demo locale. */
export const timelineMock: TimelineDemoFixture[] = [
  { id: "career-2016-bkit", palette: 7 },
  { id: "career-2019-cynergy", palette: 2 },
  { id: "project-2022-mobileklink", palette: 4 },
  { id: "career-2023-nextjs", palette: 6 },
  { id: "career-2024-helpdesk", palette: 5 },
  { id: "portfolio-2025-sunghwan-portal", palette: 1 },
];
