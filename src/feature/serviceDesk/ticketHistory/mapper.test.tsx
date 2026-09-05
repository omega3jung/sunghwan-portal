import type { TFunction } from "i18next";
import { Bot } from "lucide-react";
import { describe, expect, it } from "vitest";

import type { TicketHistory, TicketHistoryEvent } from "@/domain/serviceDesk";

import {
  getHistorySummary,
  mapTicketHistoryToTimelineItem,
  resolveHistoryDescription,
  resolveHistoryIcon,
} from "./mapper";

const t = ((key: string, options?: Record<string, unknown>) =>
  options ? `${key}:${JSON.stringify(options)}` : key) as TFunction;
const tStatus = ((key: string) => `status:${key}`) as TFunction;

describe("Ticket history presentation mapper", () => {
  it.each([
    ["STATUS_UPDATED", "history.STATUS_UPDATED"],
    ["APPROVAL_APPROVED", "history.APPROVAL_APPROVED"],
    ["ASSIGNMENT_UPDATED", "history.ASSIGNMENT_UPDATED"],
    ["WORK_SESSION_UPDATED", "history.WORK_SESSION_UPDATED"],
  ] as const)("maps %s to its stable summary", (event, expectedKey) => {
    const history = createHistory(event, {
      fromValue: { status: "Assigned" },
      toValue: { status: "Working" },
    });

    expect(getHistorySummary(history, t, tStatus)).toContain(expectedKey);
  });

  it("distinguishes merged and escalated targets from metadata", () => {
    const merged = createHistory("TICKET_MERGED", {
      metadata: { closeReason: "Merged", mergedIntoTicketNo: "T-2" },
    });
    const escalated = createHistory("TICKET_MERGED", {
      metadata: { closeReason: "Escalated", mergedIntoTicketId: "ticket-2" },
    });

    expect(getHistorySummary(merged, t, tStatus)).toContain("history.MERGED");
    expect(getHistorySummary(merged, t, tStatus)).toContain("T-2");
    expect(getHistorySummary(escalated, t, tStatus)).toContain("history.ESCALATED");
    expect(getHistorySummary(escalated, t, tStatus)).toContain("ticket-2");
  });

  it("uses the system marker independently of event type", () => {
    const icon = resolveHistoryIcon(
      createHistory("RESOLUTION_CLOSE", { source: "SYSTEM_AUTO" }),
    );
    expect(icon.type).toBe(Bot);
  });

  it("falls back safely for unexpected metadata and preserves a reason description", () => {
    const history = createHistory("TICKET_UPDATED", {
      metadata: {
        reason: "configuration changed",
        ...({ unexpected: { nested: true } } as object),
      },
    });

    expect(resolveHistoryDescription(history, t)).toBe("configuration changed");
    expect(() =>
      mapTicketHistoryToTimelineItem(history, {
        t,
        tCommon: t,
        tHistory: t,
        tStatus,
      }),
    ).not.toThrow();
  });
});

function createHistory(
  event: TicketHistoryEvent,
  overrides: Partial<TicketHistory> = {},
): TicketHistory {
  return {
    ticketId: "ticket-1",
    historyNo: 1,
    type: event.startsWith("APPROVAL")
      ? "APPROVAL"
      : event.startsWith("ASSIGNMENT")
        ? "ASSIGNMENT"
        : "STATUS",
    source: "USER_ACTION",
    event,
    actorUsername: "worker",
    actorName: null,
    actionNo: null,
    metadata: null,
    createdAt: "2026-09-01T00:00:00.000Z",
    ...overrides,
  };
}
