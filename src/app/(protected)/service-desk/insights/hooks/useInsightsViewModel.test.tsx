// @vitest-environment jsdom

import { cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { TicketSummary, TicketUser } from "@/domain/serviceDesk";
import type { ChartFilter } from "@/feature/serviceDesk/ticket/client";

import { useInsightsViewModel } from "./useInsightsViewModel";

vi.mock("react-i18next", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-i18next")>()),
  useTranslation: (_namespace: string, options?: { keyPrefix?: string }) => ({
    t: (key: string) => options?.keyPrefix ? `${options.keyPrefix}.${key}` : key,
  }),
}));

vi.mock("@/lib/client/i18n", () => ({
  useLocalizedValue: () => (value: Record<string, unknown>) => value.en,
}));

function createTicket(
  id: string,
  overrides: Partial<TicketSummary> = {},
): TicketSummary {
  return {
    id,
    status: "Working",
    categoryName: { en: "Account" },
    requesterDepartmentId: "department-1",
    requesterDepartmentName: { en: "IT" },
    tenantId: "tenant-1",
    tenantName: { en: "Customer" },
    assignmentPhase: "WORK",
    approvalAssigneeUsernames: [],
    workAssigneeUsernames: ["worker"],
    dueAt: "2026-09-07T12:00:00Z",
    ...overrides,
  } as TicketSummary;
}

const assignees: TicketUser[] = [
  {
    username: "worker",
    name: { en: { first: "Work", last: "Er" } },
    image: null,
  },
];

const tickets = [
  createTicket("ticket-1"),
  createTicket("ticket-2", {
    status: "Assigned",
    categoryName: { en: "Hardware" },
    requesterDepartmentId: null,
    requesterDepartmentName: null,
    tenantId: null,
    tenantName: null,
    workAssigneeUsernames: [],
    dueAt: "2026-09-01T12:00:00Z",
  }),
];

afterEach(cleanup);

describe("useInsightsViewModel", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-06T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("builds every chart from the same supplied ticket set including fallback groups", () => {
    const { result } = renderHook(() =>
      useInsightsViewModel({
        tickets,
        assignees,
        language: "en",
        chartFilter: null,
        isLoading: false,
      }),
    );

    expect(result.current.totalTicketCount).toBe(2);
    expect(result.current.filteredTickets).toEqual(tickets);
    expect(result.current.chartData.status.reduce((sum, item) => sum + item.count, 0)).toBe(2);
    expect(result.current.chartData.department).toContainEqual(
      expect.objectContaining({ value: "insights.unknownDepartment", count: 1 }),
    );
    expect(result.current.chartData.tenant).toContainEqual(
      expect.objectContaining({ value: "insights.unknownTenant", count: 1 }),
    );
    expect(result.current.chartData.assignee).toContainEqual(
      expect.objectContaining({ value: "__unassigned__", count: 1 }),
    );
  });

  it.each([
    ["status", { type: "status", value: "Working", label: "Working" }],
    ["assignee", { type: "assignee", value: "__unassigned__", label: "Unassigned" }],
    ["tenant fallback", { type: "tenant", value: "insights.unknownTenant", label: "Unknown" }],
  ] as Array<[string, NonNullable<ChartFilter>]>)
  ("filters result tickets and count for %s selections", (_, chartFilter) => {
    const { result } = renderHook(() =>
      useInsightsViewModel({
        tickets,
        assignees,
        language: "en",
        chartFilter,
        isLoading: false,
      }),
    );

    expect(result.current.filteredTickets).toHaveLength(1);
    expect(result.current.filteredTicketCount).toBe(1);
    expect(result.current.showFilteredEmpty).toBe(false);
    expect(result.current.filterFieldLabel).not.toBeNull();
  });

  it("shows a filtered empty state only after loading completes", () => {
    const chartFilter: NonNullable<ChartFilter> = {
      type: "category",
      value: "Missing category",
      label: "Missing category",
    };
    const { result, rerender } = renderHook(
      ({ isLoading }) =>
        useInsightsViewModel({
          tickets,
          assignees,
          language: "en",
          chartFilter,
          isLoading,
        }),
      { initialProps: { isLoading: true } },
    );

    expect(result.current.showFilteredEmpty).toBe(false);
    rerender({ isLoading: false });
    expect(result.current.showFilteredEmpty).toBe(true);
    expect(result.current.filteredTickets).toEqual([]);
  });
});
