import { describe, expect, it } from "vitest";

import {
  assertTicketDueAtMeetsSla,
  getMinimumTicketDueAt,
  resolveCategoryChangeDueAt,
} from "./ticketSlaPolicy";

const now = new Date("2026-08-13T10:30:00.000Z");

describe("ticket SLA policy", () => {
  it("calculates the category minimum and rejects earlier create due dates", () => {
    expect(getMinimumTicketDueAt(3, now).toISOString()).toBe(
      "2026-08-16T00:00:00.000Z",
    );
    expect(() =>
      assertTicketDueAtMeetsSla("2026-08-15T23:59:59.999Z", 3, now),
    ).toThrow("serviceDesk.tickets.dueBeforeCategorySla");
    expect(() =>
      assertTicketDueAtMeetsSla("2026-08-16T00:00:00.000Z", 3, now),
    ).not.toThrow();
  });

  it("never shortens due date during a category-changing update", () => {
    expect(
      resolveCategoryChangeDueAt(
        "2026-08-20T09:00:00.000Z",
        "2026-08-14T09:00:00.000Z",
        3,
        now,
      ).toISOString(),
    ).toBe("2026-08-20T09:00:00.000Z");
    expect(
      resolveCategoryChangeDueAt(
        "2026-08-14T09:00:00.000Z",
        "2026-08-15T09:00:00.000Z",
        3,
        now,
      ).toISOString(),
    ).toBe("2026-08-16T00:00:00.000Z");
  });
});
