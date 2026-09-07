import { describe, expect, it, vi } from "vitest";

import type { TicketSummary } from "@/domain/serviceDesk";
import type { ChartFilter } from "@/feature/serviceDesk/ticket/client";

import {
  getChartFilterFieldLabel,
  isDateRangePreset,
  isTicketMatchedByChartFilter,
  toCompleteCriteriaPeriodRange,
} from "./util";

function createTicket(overrides: Partial<TicketSummary> = {}): TicketSummary {
  return {
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

const matcherDefaults = {
  getCategoryLabel: (ticket: TicketSummary) => ticket.categoryName.en ?? "",
  fallbackDepartmentLabel: "Unknown department",
  fallbackTenantLabel: "Unknown tenant",
};

describe("Insights date range helpers", () => {
  it("accepts supported presets and rejects arbitrary values", () => {
    expect(isDateRangePreset("last_3month")).toBe(true);
    expect(isDateRangePreset("arbitrary")).toBe(false);
  });

  it("returns a criteria range only when both dates are present", () => {
    const from = new Date("2026-08-01T00:00:00Z");
    const to = new Date("2026-08-31T00:00:00Z");

    expect(toCompleteCriteriaPeriodRange({ from })).toBeNull();
    expect(toCompleteCriteriaPeriodRange({ from, to })).toEqual({ from, to });
  });
});

describe("isTicketMatchedByChartFilter", () => {
  const cases: Array<[string, NonNullable<ChartFilter>, Partial<TicketSummary>]> = [
    ["status", { type: "status", value: "Working", label: "Working" }, {}],
    ["category", { type: "category", value: "Account", label: "Account" }, {}],
    ["department", { type: "department", value: "department-1", label: "IT" }, {}],
    ["tenant", { type: "tenant", value: "tenant-1", label: "Customer" }, {}],
    ["assignee", { type: "assignee", value: "worker", label: "Worker" }, {}],
    ["SLA", { type: "sla", value: "later", label: "Later" }, {}],
  ];

  it.each(cases)("matches a ticket by %s", (_, filter, overrides) => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-06T12:00:00Z"));

    expect(
      isTicketMatchedByChartFilter({
        ticket: createTicket(overrides),
        filter,
        ...matcherDefaults,
      }),
    ).toBe(true);

    vi.useRealTimers();
  });

  it("uses explicit fallback buckets for missing department and tenant", () => {
    const ticket = createTicket({
      requesterDepartmentId: null,
      requesterDepartmentName: null,
      tenantId: null,
      tenantName: null,
    });

    expect(
      isTicketMatchedByChartFilter({
        ticket,
        filter: {
          type: "department",
          value: "Unknown department",
          label: "Unknown department",
        },
        ...matcherDefaults,
      }),
    ).toBe(true);
    expect(
      isTicketMatchedByChartFilter({
        ticket,
        filter: {
          type: "tenant",
          value: "Unknown tenant",
          label: "Unknown tenant",
        },
        ...matcherDefaults,
      }),
    ).toBe(true);
  });

  it("matches the unassigned bucket against the effective assignment phase", () => {
    const ticket = createTicket({ workAssigneeUsernames: [] });

    expect(
      isTicketMatchedByChartFilter({
        ticket,
        filter: {
          type: "assignee",
          value: "__unassigned__",
          label: "Unassigned",
        },
        ...matcherDefaults,
      }),
    ).toBe(true);
  });
});

describe("getChartFilterFieldLabel", () => {
  it("maps each filter type to its supplied field label", () => {
    const labels = {
      status: "Status",
      category: "Category",
      department: "Department",
      tenant: "Tenant",
      assignee: "Assignee",
      sla: "SLA",
    };

    expect(getChartFilterFieldLabel("tenant", labels)).toBe("Tenant");
    expect(getChartFilterFieldLabel("sla", labels)).toBe("SLA");
  });
});
