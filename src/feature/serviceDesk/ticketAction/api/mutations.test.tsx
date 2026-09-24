// @vitest-environment jsdom

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { TicketAction } from "@/domain/serviceDesk";

import { ticketQueryKeys } from "../../ticket/api/queryKeys";
import { ticketHistoryQueryKeys } from "../../ticketHistory/api";
import { ticketWorkSessionQueryKeys } from "../../ticketWorkSession/api";
import { useDeleteServiceDeskTicketAction, useTicketActionMutation } from "./mutations";
import { ticketActionQueryKeys } from "./queryKeys";

const apiMock = vi.hoisted(() => ({
  execute: vi.fn(),
  remove: vi.fn(),
}));

vi.mock("./api", () => ({
  serviceDeskTicketActionApi: {
    execute: apiMock.execute,
    remove: apiMock.remove,
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
    const searchKey = ticketQueryKeys.search({ page: 1, pageSize: 20 });
    queryClient.setQueryData(searchKey, { items: [{ id: "ticket-1" }] });
    queryClient.setQueryData(ticketActionQueryKeys.list("ticket-1"), [
      existingAction,
    ]);
    const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useTicketActionMutation(), { wrapper });

    await result.current.mutateAsync(command);

    expect(queryClient.getQueryState(searchKey)?.isInvalidated).toBe(true);
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
        ticketQueryKeys.searches(),
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

describe("useDeleteServiceDeskTicketAction", () => {
  it("invalidates the ticket history and existing projections without synthesizing cache data", async () => {
    apiMock.remove.mockResolvedValue(createAction(1, { active: false }));
    const { queryClient, wrapper } = createQueryClientTestContext();
    const action = createAction(1);
    const history = [{ id: "existing-history" }];
    const entries = [
      [ticketActionQueryKeys.list("ticket-1"), [action]],
      [ticketActionQueryKeys.detail("ticket-1", "1"), action],
      [ticketQueryKeys.detail("ticket-1"), { id: "ticket-1" }],
      [ticketQueryKeys.lists(), []],
      [ticketQueryKeys.search({ page: 1, pageSize: 20 }), { items: [] }],
      [ticketWorkSessionQueryKeys.list("ticket-1"), []],
      [ticketHistoryQueryKeys.list("ticket-1"), history],
    ] as const;
    for (const [key, data] of entries) queryClient.setQueryData(key, data);
    const otherHistoryKey = ticketHistoryQueryKeys.list("ticket-2");
    queryClient.setQueryData(otherHistoryKey, []);
    const { result } = renderHook(() => useDeleteServiceDeskTicketAction(), { wrapper });

    await result.current.mutateAsync({ ticketId: "ticket-1", actionNo: "1" });

    expect(apiMock.remove).toHaveBeenCalledWith({ ticketId: "ticket-1", actionNo: "1" });
    for (const [key, data] of entries) {
      expect(queryClient.getQueryState(key)?.isInvalidated).toBe(true);
      expect(queryClient.getQueryData(key)).toEqual(data);
    }
    expect(queryClient.getQueryState(otherHistoryKey)?.isInvalidated).toBe(false);
  });

  it("keeps action and history caches unchanged when soft-delete fails", async () => {
    apiMock.remove.mockRejectedValue(new Error("delete failed"));
    const { queryClient, wrapper } = createQueryClientTestContext();
    const action = createAction(1);
    const entries = [
      [ticketActionQueryKeys.list("ticket-1"), [action]],
      [ticketActionQueryKeys.detail("ticket-1", "1"), action],
      [ticketHistoryQueryKeys.list("ticket-1"), [{ id: "existing-history" }]],
    ] as const;
    for (const [key, data] of entries) queryClient.setQueryData(key, data);
    const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useDeleteServiceDeskTicketAction(), { wrapper });

    await expect(result.current.mutateAsync({ ticketId: "ticket-1", actionNo: "1" })).rejects.toThrow("delete failed");

    expect(invalidateQueries).not.toHaveBeenCalled();
    for (const [key, data] of entries) {
      expect(queryClient.getQueryState(key)?.isInvalidated).toBe(false);
      expect(queryClient.getQueryData(key)).toEqual(data);
    }
  });
});
