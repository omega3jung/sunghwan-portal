// @vitest-environment jsdom

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { TicketAction } from "@/domain/serviceDesk";

import { ticketQueryKeys } from "../../ticket/api/queryKeys";
import { ticketHistoryQueryKeys } from "../../ticketHistory/api";
import { ticketWorkSessionQueryKeys } from "../../ticketWorkSession/api";
import { useTicketActionMutation } from "./mutations";
import { ticketActionQueryKeys } from "./queryKeys";

const apiMock = vi.hoisted(() => ({
  execute: vi.fn(),
}));

vi.mock("./api", () => ({
  serviceDeskTicketActionApi: {
    execute: apiMock.execute,
    remove: vi.fn(),
  },
}));

afterEach(cleanup);

beforeEach(() => {
  vi.clearAllMocks();
});

function createAction(
  actionNo: number,
  overrides: Partial<TicketAction> = {},
): TicketAction {
  return {
    ticketId: "ticket-1",
    actionNo,
    actionType: "COMMENT",
    content: `Comment ${actionNo}`,
    ownerUsername: "agent-1",
    ownerName: { en: { first: "Agent", last: "One" } },
    createdAt: "2026-08-01T00:00:00.000Z",
    active: true,
    files: [],
    images: [],
    ...overrides,
  };
}

function createQueryClientTestContext() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return { queryClient, wrapper };
}

const command = {
  ticketId: "ticket-1",
  actionType: "COMMENT" as const,
  values: {
    id: "agent-1",
    actionType: "COMMENT" as const,
    content: "New comment",
    files: [],
    images: [],
  },
};

describe("useTicketActionMutation", () => {
  it("publishes the committed action and refreshes every affected projection", async () => {
    const existingAction = createAction(1);
    const newAction = createAction(2);
    apiMock.execute.mockResolvedValue(newAction);
    const { queryClient, wrapper } = createQueryClientTestContext();
    queryClient.setQueryData(ticketActionQueryKeys.list("ticket-1"), [
      existingAction,
    ]);
    const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useTicketActionMutation(), { wrapper });

    await result.current.mutateAsync(command);

    await waitFor(() => {
      expect(
        queryClient.getQueryData(ticketActionQueryKeys.list("ticket-1")),
      ).toEqual([existingAction, newAction]);
    });
    expect(
      queryClient.getQueryData(ticketActionQueryKeys.detail("ticket-1", "2")),
    ).toEqual(newAction);

    const invalidatedKeys = invalidateQueries.mock.calls.map(
      ([filters]) => filters?.queryKey,
    );
    expect(invalidatedKeys).toEqual(
      expect.arrayContaining([
        ticketActionQueryKeys.list("ticket-1"),
        ticketActionQueryKeys.detail("ticket-1", "2"),
        ticketQueryKeys.detail("ticket-1"),
        ticketQueryKeys.lists(),
        ticketWorkSessionQueryKeys.list("ticket-1"),
        ticketHistoryQueryKeys.list("ticket-1"),
      ]),
    );
  });

  it("does not publish or invalidate projections when the command fails", async () => {
    const existingAction = createAction(1);
    apiMock.execute.mockRejectedValue(new Error("command failed"));
    const { queryClient, wrapper } = createQueryClientTestContext();
    queryClient.setQueryData(ticketActionQueryKeys.list("ticket-1"), [
      existingAction,
    ]);
    const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useTicketActionMutation(), { wrapper });

    await expect(result.current.mutateAsync(command)).rejects.toThrow(
      "command failed",
    );

    expect(
      queryClient.getQueryData(ticketActionQueryKeys.list("ticket-1")),
    ).toEqual([existingAction]);
    expect(invalidateQueries).not.toHaveBeenCalled();
  });
});
