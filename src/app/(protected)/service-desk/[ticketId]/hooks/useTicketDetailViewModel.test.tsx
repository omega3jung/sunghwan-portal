// @vitest-environment jsdom

import { cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { TicketAction, TicketDetail, TicketHistory } from "@/domain/serviceDesk";

import { useTicketDetailViewModel } from "./useTicketDetailViewModel";

const mocks = vi.hoisted(() => ({
  useCategoryListQuery: vi.fn(),
  useCurrentSession: vi.fn(),
  useEmployeeListQuery: vi.fn(),
}));

vi.mock("@/feature/auth/session/client", () => ({
  useCurrentSession: mocks.useCurrentSession,
}));

vi.mock("@/feature/organization/employee/client", () => ({
  useEmployeeListQuery: mocks.useEmployeeListQuery,
}));

vi.mock("@/feature/serviceDesk/category/client", () => ({
  useServiceDeskCategoryListQuery: mocks.useCategoryListQuery,
}));

vi.mock("@/feature/user/preference/client", () => ({
  useCurrentPreference: () => ({ current: { language: "en" } }),
}));

vi.mock("@/lib/client/i18n", () => ({
  useLocalizedValue: () => (value: Record<string, unknown>) => value.en,
}));

function createTicket(assignmentPhase: "APPROVAL" | "WORK"): TicketDetail {
  return {
    id: "ticket-1",
    requester: {
      username: "requester",
      email: "requester@example.com",
      image: null,
      name: { en: { first: "Request", last: "Er" } },
    },
    assignmentPhase,
    approvalAssignees: [
      {
        username: "approver",
        image: null,
        name: { en: { first: "App", last: "Rover" } },
      },
    ],
    workAssignees: [
      {
        username: "worker",
        image: null,
        name: { en: { first: "Work", last: "Er" } },
      },
    ],
  } as TicketDetail;
}

function createAction(
  actionNo: number,
  createdAt: string,
  active: boolean,
): TicketAction {
  return {
    ticketId: "ticket-1",
    actionNo,
    actionType: "COMMENT",
    content: "comment",
    ownerUsername: `user-${actionNo}`,
    ownerName: actionNo === 2 ? { en: { first: "Latest", last: "Owner" } } : null,
    createdAt,
    active,
    files: [],
    images: [],
  };
}

function createHistory(historyNo: number, createdAt: string): TicketHistory {
  return {
    ticketId: "ticket-1",
    historyNo,
    type: "COMMENT",
    source: "USER_ACTION",
    event: "COMMENT_CREATED",
    actorUsername: null,
    actorName: null,
    actionNo: null,
    metadata: null,
    createdAt,
  };
}

afterEach(cleanup);

describe("useTicketDetailViewModel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useCurrentSession.mockReturnValue({ current: { user: { companyId: 22 } } });
    mocks.useCategoryListQuery.mockReturnValue({
      data: [{ categories: [{ id: "category-1" }] }],
    });
    mocks.useEmployeeListQuery.mockReturnValue({
      data: [
        {
          username: "worker",
          email: "worker@example.com",
          imageUrl: null,
          name: { en: { first: "Work", last: "Er" } },
        },
      ],
    });
  });

  it.each([
    ["APPROVAL", "approver", "App Rover"],
    ["WORK", "worker", "Work Er"],
  ] as const)("maps the %s assignment phase to the displayed assignees", (phase, username, label) => {
    const { result } = renderHook(() =>
      useTicketDetailViewModel({ ticket: createTicket(phase) }),
    );

    expect(result.current.ticketAssignees).toEqual([
      expect.objectContaining({ value: username, label }),
    ]);
    expect(result.current.requesterName).toBe("Request Er");
  });

  it("selects the latest active action and latest history independently", () => {
    const actions = [
      createAction(1, "2026-09-01T10:00:00Z", true),
      createAction(2, "2026-09-02T10:00:00Z", true),
      createAction(3, "2026-09-03T10:00:00Z", false),
    ];
    const histories = [
      createHistory(1, "2026-09-04T10:00:00Z"),
      createHistory(2, "2026-09-05T10:00:00Z"),
    ];

    const { result } = renderHook(() =>
      useTicketDetailViewModel({
        ticket: createTicket("WORK"),
        ticketActions: actions,
        ticketHistories: histories,
      }),
    );

    expect(result.current.activeActions.map((action) => action.actionNo)).toEqual([1, 2]);
    expect(result.current.latestAction?.actionNo).toBe(2);
    expect(result.current.latestActionOwnerName).toBe("Latest Owner");
    expect(result.current.latestHistory?.historyNo).toBe(2);
    expect(result.current.categories).toEqual([{ id: "category-1" }]);
    expect(result.current.assigneeOptions[0]).toMatchObject({
      value: "worker",
      label: "Work Er",
    });
  });
});
