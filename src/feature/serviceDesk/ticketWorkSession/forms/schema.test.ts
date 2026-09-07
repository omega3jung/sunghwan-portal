import { describe, expect, it } from "vitest";

import {
  ticketTrackDurationFormSchema,
  ticketTrackRangeFormSchema,
} from "./schema";

describe("ticket work session form validation", () => {
  it("accepts only positive whole-minute duration entries", () => {
    expect(
      ticketTrackDurationFormSchema.parse({
        durationMinutes: "15",
        note: "  Investigated logs  ",
      }),
    ).toEqual({ durationMinutes: 15, note: "Investigated logs" });

    for (const durationMinutes of [0, -1, 1.5]) {
      expect(
        ticketTrackDurationFormSchema.safeParse({ durationMinutes }).success,
      ).toBe(false);
    }
  });

  it("requires a valid range whose end is later than its start", () => {
    const startAt = "2026-09-01T09:00:00.000Z";

    expect(
      ticketTrackRangeFormSchema.safeParse({
        startAt,
        endAt: "2026-09-01T09:30:00.000Z",
      }).success,
    ).toBe(true);

    for (const endAt of [
      "2026-09-01T09:00:00.000Z",
      "2026-09-01T08:59:00.000Z",
      "not-a-date",
    ]) {
      const result = ticketTrackRangeFormSchema.safeParse({ startAt, endAt });

      expect(result.success).toBe(false);
      expect(result.error?.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ path: ["endAt"] }),
        ]),
      );
    }
  });

  it("normalizes an omitted note to an empty string", () => {
    expect(
      ticketTrackRangeFormSchema.parse({
        startAt: "2026-09-01T09:00:00.000Z",
        endAt: "2026-09-01T09:30:00.000Z",
      }).note,
    ).toBe("");
  });
});
