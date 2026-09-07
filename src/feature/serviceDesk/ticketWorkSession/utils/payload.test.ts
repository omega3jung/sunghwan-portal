import { afterEach, describe, expect, it, vi } from "vitest";

import {
  canChangeStatus,
  getCurrentTrackedMinutes,
  getTrackedMinutesFromRange,
  getWorkSessionSubmitPayload,
} from "./payload";

afterEach(() => {
  vi.useRealTimers();
});

describe("ticket work session payload", () => {
  it("counts only complete forward ranges and floors partial minutes", () => {
    expect(
      getTrackedMinutesFromRange({
        startAt: "2026-09-01T09:00:00.000Z",
        endAt: "2026-09-01T09:01:59.999Z",
      }),
    ).toBe(1);
    expect(
      getTrackedMinutesFromRange({
        startAt: "2026-09-01T09:00:00.000Z",
        endAt: "2026-09-01T09:00:00.000Z",
      }),
    ).toBe(0);
    expect(getTrackedMinutesFromRange({ startAt: "invalid" })).toBe(0);
  });

  it("normalizes duration input before deciding whether status may change", () => {
    expect(
      getCurrentTrackedMinutes({
        inputMode: "duration",
        durationValues: { durationMinutes: "12" },
      }),
    ).toBe(12);
    expect(
      getCurrentTrackedMinutes({
        inputMode: "duration",
        durationValues: { durationMinutes: 1.5 },
      }),
    ).toBe(0);

    expect(
      canChangeStatus({
        previousTrackedMinutes: 10,
        currentTrackedMinutes: 0,
      }),
    ).toBe(true);
    expect(
      canChangeStatus({
        previousTrackedMinutes: 0,
        currentTrackedMinutes: -10,
      }),
    ).toBe(false);
  });

  it("anchors duration entries once at submission time", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-01T10:00:00.000Z"));

    expect(
      getWorkSessionSubmitPayload({
        ticketId: "ticket-1",
        inputMode: "duration",
        durationValues: { durationMinutes: 30 },
        nextStatus: "Pending",
        note: "  Waiting for requester  ",
      }),
    ).toEqual({
      ticketId: "ticket-1",
      inputMode: "duration",
      durationMinutes: 30,
      startAt: "2026-09-01T09:30:00.000Z",
      endAt: "2026-09-01T10:00:00.000Z",
      nextStatus: "Pending",
      note: "Waiting for requester",
    });
  });

  it("preserves an explicit range and omits a blank note", () => {
    expect(
      getWorkSessionSubmitPayload({
        ticketId: "ticket-1",
        inputMode: "range",
        rangeValues: {
          startAt: "2026-09-01T18:00:00+09:00",
          endAt: "2026-09-01T18:45:00+09:00",
        },
        nextStatus: "Resolved",
        note: "   ",
      }),
    ).toEqual({
      ticketId: "ticket-1",
      inputMode: "range",
      durationMinutes: 45,
      startAt: "2026-09-01T09:00:00.000Z",
      endAt: "2026-09-01T09:45:00.000Z",
      nextStatus: "Resolved",
      note: undefined,
    });
  });
});
