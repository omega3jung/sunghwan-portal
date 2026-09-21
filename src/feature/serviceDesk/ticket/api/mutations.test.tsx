// @vitest-environment jsdom

import { QueryClient, QueryClientProvider, QueryObserver } from "@tanstack/react-query";
import { cleanup, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ticketSearchCriteriaFormDefaultValues } from "@/feature/serviceDesk/ticketSearch/forms/defaultValues";
import { applyRuleGroupFilter } from "@/lib/application/api/query";
import type { TicketSearchRequest } from "@/lib/application/contracts/serviceDesk";

const api = vi.hoisted(() => ({
  create: vi.fn(),
  search: vi.fn(),
  update: vi.fn(),
  updateRequester: vi.fn(),
  startWork: vi.fn(),
  remove: vi.fn(),
  prepareAttachments: vi.fn(),
}));

vi.mock("./api", () => ({ serviceDeskTicketApi: api }));
vi.mock("@/feature/serviceDesk/shared/client", () => ({
  useServiceDeskQueryOptions: () => ({
    dataScope: "LOCAL",
    queryOptions: { staleTime: Infinity },
  }),
}));

import { ticketDraftQueryKeys } from "../../ticketDraft/api";
import { ticketHistoryQueryKeys } from "../../ticketHistory/api";
import {
  useCreateServiceDeskTicket,
  useRequesterUpdateServiceDeskTicket,
  useStartTicketWorkMutation,
  useUpdateServiceDeskTicket,
} from "./mutations";
import { useServiceDeskTicketSearchQuery } from "./queries";
import { ticketQueryKeys } from "./queryKeys";

afterEach(cleanup);
beforeEach(() => vi.clearAllMocks());

describe("Ticket mutation cache coordination", () => {
  it("shows a ticket created later on the search end date after automatic refetch", async () => {
    const createdTicket = {
      id: "ticket-new",
      active: true,
      cat_scope: "PORTAL",
      createdAt: new Date(2026, 8, 21, 11).toISOString(),
    };
    const tickets: typeof createdTicket[] = [];
    api.search.mockImplementation(async (request: TicketSearchRequest) => {
      const items = applyRuleGroupFilter(tickets, request.filter);
      return { items, totalCount: items.length, page: 1, pageSize: 20 };
    });
    api.create.mockImplementation(async () => {
      tickets.push(createdTicket);
      return createdTicket;
    });
    const { queryClient, wrapper } = createContext();
    const criteria = {
      ...ticketSearchCriteriaFormDefaultValues,
      cat_scope: "PORTAL" as const,
      period: {
        type: "last_3month",
        dateRange: {
          from: new Date(2026, 5, 21, 10),
          to: new Date(2026, 8, 21, 10),
        },
      },
    };
    const { result, unmount } = renderHook(() => ({
      search: useServiceDeskTicketSearchQuery({
        criteria, sort: "ticketNumber", order: "desc", page: 1, pageSize: 20,
      }),
      create: useCreateServiceDeskTicket(),
    }), { wrapper });

    try {
      await waitFor(() => expect(result.current.search.isSuccess).toBe(true));
      expect(result.current.search.data?.items).toEqual([]);

      await result.current.create.mutateAsync({} as never);

      await waitFor(() => expect(api.search).toHaveBeenCalledTimes(2));
      await waitFor(() => expect(result.current.search.data?.items).toEqual([createdTicket]));
    } finally {
      unmount();
      queryClient.clear();
    }
  });

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
      ticketHistoryQueryKeys.list("ticket-1"),
    ]);
  });

  it("refreshes the lifecycle projections after start-work", async () => {
    api.startWork.mockResolvedValue({ id: "ticket-1", status: "Working" });
    const { queryClient, wrapper } = createContext();
    const searchKey = ticketQueryKeys.search({ page: 1, pageSize: 20 });
    queryClient.setQueryData(searchKey, { items: [{ id: "ticket-1", status: "Assigned" }] });
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useStartTicketWorkMutation(), { wrapper });

    await result.current.mutateAsync({ ticketId: "ticket-1" });

    expect(queryClient.getQueryState(searchKey)?.isInvalidated).toBe(true);
    expect(keysOf(invalidate)).toEqual([
      ticketQueryKeys.detail("ticket-1"),
      ticketQueryKeys.lists(),
      ticketQueryKeys.searches(),
      ticketHistoryQueryKeys.list("ticket-1"),
    ]);
  });

  it("refetches an active detail only once after requester update", async () => {
    const updatedTicket = { id: "ticket-1", subject: "Updated" };
    api.updateRequester.mockResolvedValue(updatedTicket);
    const { queryClient, wrapper } = createContext();
    const detailKey = ticketQueryKeys.detail("ticket-1");
    const collectionKeys = [
      ticketQueryKeys.list({ page: 1, pageSize: 20 }),
      ticketQueryKeys.search({ page: 1, pageSize: 20 }),
      ticketHistoryQueryKeys.list("ticket-1"),
    ];
    for (const key of collectionKeys) queryClient.setQueryData(key, []);
    queryClient.setQueryData(detailKey, { id: "ticket-1", subject: "Original" });
    const fetchDetail = vi.fn().mockResolvedValue(updatedTicket);
    const observer = new QueryObserver(queryClient, {
      queryKey: detailKey,
      queryFn: fetchDetail,
      staleTime: Infinity,
    });
    const unsubscribe = observer.subscribe(() => {});
    const { result } = renderHook(() => useRequesterUpdateServiceDeskTicket(), { wrapper });

    try {
      expect(fetchDetail).not.toHaveBeenCalled();
      await result.current.mutateAsync({ ticketId: "ticket-1", data: {} as never });
      await waitFor(() => expect(queryClient.getQueryData(detailKey)).toEqual(updatedTicket));
      expect(fetchDetail).toHaveBeenCalledTimes(1);
      for (const key of collectionKeys) {
        expect(queryClient.getQueryState(key)?.isInvalidated).toBe(true);
      }
    } finally {
      unsubscribe();
      queryClient.clear();
    }
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
