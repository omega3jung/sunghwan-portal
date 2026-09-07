// @vitest-environment jsdom

import { cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useTicketDetailData } from "./useTicketDetailData";

const mocks = vi.hoisted(() => ({
  useActionListQuery: vi.fn(),
  useHistoryListQuery: vi.fn(),
  useTicketQuery: vi.fn(),
}));

vi.mock("@/feature/serviceDesk/ticket/client", () => ({
  useServiceDeskTicketQuery: mocks.useTicketQuery,
}));

vi.mock("@/feature/serviceDesk/ticketAction/client", () => ({
  useServiceDeskTicketActionListQuery: mocks.useActionListQuery,
}));

vi.mock("@/feature/serviceDesk/ticketHistory/client", () => ({
  useServiceDeskTicketHistoryListQuery: mocks.useHistoryListQuery,
}));

afterEach(cleanup);

describe("useTicketDetailData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads ticket, actions, and history with the same route ticket id", () => {
    const ticket = { id: "ticket-1" };
    const actions = [{ actionNo: 1 }];
    const histories = [{ historyNo: 1 }];
    mocks.useTicketQuery.mockReturnValue({ data: ticket, isLoading: false });
    mocks.useActionListQuery.mockReturnValue({ data: actions, isLoading: true });
    mocks.useHistoryListQuery.mockReturnValue({ data: histories, isLoading: false });

    const { result } = renderHook(() => useTicketDetailData("ticket-1"));

    expect(mocks.useTicketQuery).toHaveBeenCalledWith("ticket-1");
    expect(mocks.useActionListQuery).toHaveBeenCalledWith("ticket-1");
    expect(mocks.useHistoryListQuery).toHaveBeenCalledWith("ticket-1");
    expect(result.current).toEqual({
      ticket,
      ticketActions: actions,
      ticketHistories: histories,
      isTicketLoading: false,
      isTicketActionsLoading: true,
      isTicketHistoriesLoading: false,
    });
  });

  it("normalizes a missing ticket to undefined while preserving loading state", () => {
    mocks.useTicketQuery.mockReturnValue({ data: null, isLoading: false });
    mocks.useActionListQuery.mockReturnValue({ data: undefined, isLoading: false });
    mocks.useHistoryListQuery.mockReturnValue({ data: undefined, isLoading: false });

    const { result } = renderHook(() => useTicketDetailData("missing"));

    expect(result.current.ticket).toBeUndefined();
    expect(result.current.isTicketLoading).toBe(false);
  });
});
