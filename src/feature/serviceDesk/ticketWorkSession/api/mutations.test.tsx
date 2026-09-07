// @vitest-environment jsdom

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({
  range: { create: vi.fn(), update: vi.fn() },
  duration: { create: vi.fn(), update: vi.fn() },
  timer: { start: vi.fn(), finish: vi.fn(), switch: vi.fn() },
  submitManual: vi.fn(),
  remove: vi.fn(),
}));

vi.mock("./api", () => ({ serviceDeskTicketWorkSessionApi: api }));

import { ticketQueryKeys } from "../../ticket/api/queryKeys";
import { ticketHistoryQueryKeys } from "../../ticketHistory/api";
import {
  useCreateTicketWorkSessionByRange,
  useDeleteTicketWorkSession,
  useFinishTicketWorkSessionr,
  useSubmitTicketWorkSession,
  useUpdateTicketWorkSessionByDuration,
} from "./mutations";
import { ticketWorkSessionQueryKeys } from "./queryKeys";

afterEach(cleanup);
beforeEach(() => vi.clearAllMocks());

describe("Work-session mutation cache coordination", () => {
  it.each([
    [
      "range create",
      useCreateTicketWorkSessionByRange,
      api.range.create,
      { ticketId: "ticket-1", values: {} },
      "8",
    ],
    [
      "manual create",
      useSubmitTicketWorkSession,
      api.submitManual,
      { ticketId: "ticket-1", note: "manual" },
      "8",
    ],
    [
      "duration update",
      useUpdateTicketWorkSessionByDuration,
      api.duration.update,
      { ticketId: "ticket-1", workSessionNo: "7", values: {} },
      "7",
    ],
    [
      "delete",
      useDeleteTicketWorkSession,
      api.remove,
      { ticketId: "ticket-1", workSessionNo: "7" },
      "7",
    ],
  ] as const)(
    "invalidates all affected projections after %s",
    async (_label, useHook, apiMock, variables, expectedNo) => {
      apiMock.mockResolvedValue({ workSessionNo: 8 });
      const { queryClient, wrapper } = createContext();
      const invalidate = vi.spyOn(queryClient, "invalidateQueries");
      const { result } = renderHook(() => useHook(), { wrapper });

      await result.current.mutateAsync(variables as never);

      expect(keysOf(invalidate)).toEqual([
        ticketWorkSessionQueryKeys.list("ticket-1"),
        ticketWorkSessionQueryKeys.detail("ticket-1", expectedNo),
        ticketHistoryQueryKeys.list("ticket-1"),
        ticketQueryKeys.detail("ticket-1"),
        ticketQueryKeys.lists(),
      ]);
    },
  );

  it("does not invalidate projections when a timer mutation fails", async () => {
    api.timer.finish.mockRejectedValue(new Error("timer failed"));
    const { queryClient, wrapper } = createContext();
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useFinishTicketWorkSessionr(), { wrapper });

    await expect(result.current.mutateAsync("ticket-1")).rejects.toThrow("timer failed");
    expect(invalidate).not.toHaveBeenCalled();
  });
});

function createContext() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { queryClient, wrapper };
}

function keysOf(spy: ReturnType<typeof vi.spyOn>) {
  return spy.mock.calls.map(
    (call: unknown[]) =>
      (call[0] as { queryKey?: readonly unknown[] } | undefined)?.queryKey,
  );
}
