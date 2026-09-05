// @vitest-environment jsdom

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({
  create: vi.fn(),
  update: vi.fn(),
  updateRequester: vi.fn(),
  startWork: vi.fn(),
  remove: vi.fn(),
  prepareAttachments: vi.fn(),
}));

vi.mock("./api", () => ({ serviceDeskTicketApi: api }));

import { ticketDraftQueryKeys } from "../../ticketDraft/api";
import { ticketHistoryQueryKeys } from "../../ticketHistory/api";
import {
  useCreateServiceDeskTicket,
  useRequesterUpdateServiceDeskTicket,
  useStartTicketWorkMutation,
  useUpdateServiceDeskTicket,
} from "./mutations";
import { ticketQueryKeys } from "./queryKeys";

afterEach(cleanup);
beforeEach(() => vi.clearAllMocks());

describe("Ticket mutation cache coordination", () => {
  it("clears ticket and draft families after ticket creation", async () => {
    api.create.mockResolvedValue({ id: "ticket-1" });
    const { queryClient, wrapper } = createContext();
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useCreateServiceDeskTicket(), { wrapper });

    await result.current.mutateAsync({} as never);

    expect(keysOf(invalidate)).toEqual([
      ticketQueryKeys.all,
      ticketDraftQueryKeys.all,
    ]);
  });

  it("refreshes list, detail, and history after requester update", async () => {
    api.updateRequester.mockResolvedValue({ id: "ticket-1" });
    const { queryClient, wrapper } = createContext();
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useRequesterUpdateServiceDeskTicket(), {
      wrapper,
    });

    await result.current.mutateAsync({ ticketId: "ticket-1", data: {} as never });

    expect(keysOf(invalidate)).toEqual([
      ticketQueryKeys.all,
      ticketQueryKeys.detail("ticket-1"),
      ticketHistoryQueryKeys.list("ticket-1"),
    ]);
  });

  it("refreshes the lifecycle projections after start-work", async () => {
    api.startWork.mockResolvedValue({ id: "ticket-1", status: "Working" });
    const { queryClient, wrapper } = createContext();
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useStartTicketWorkMutation(), { wrapper });

    await result.current.mutateAsync({ ticketId: "ticket-1" });

    expect(keysOf(invalidate)).toEqual([
      ticketQueryKeys.detail("ticket-1"),
      ticketQueryKeys.lists(),
      ticketHistoryQueryKeys.list("ticket-1"),
    ]);
  });

  it("does not invalidate ticket caches when an update fails", async () => {
    api.update.mockRejectedValue(new Error("update failed"));
    const { queryClient, wrapper } = createContext();
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useUpdateServiceDeskTicket(), { wrapper });

    await expect(result.current.mutateAsync({} as never)).rejects.toThrow("update failed");
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
