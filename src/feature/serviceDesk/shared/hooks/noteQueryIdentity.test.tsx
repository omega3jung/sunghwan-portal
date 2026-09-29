// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  effective: "operator", actions: vi.fn(), action: vi.fn(), histories: vi.fn(), ticket: vi.fn(),
}));
vi.mock("@/feature/auth/session/client", () => ({
  useCurrentSession: () => ({ data: {
    user: { username: "original-admin", dataScope: "LOCAL" },
    impersonation: { impersonatedUser: { username: mocks.effective } },
  } }),
}));
vi.mock("@/feature/serviceDesk/ticketAction/api/api", () => ({
  serviceDeskTicketActionApi: { list: mocks.actions, get: mocks.action },
}));
vi.mock("@/feature/serviceDesk/ticketHistory/api/api", () => ({
  serviceDeskTicketHistoryApi: { list: mocks.histories },
}));
vi.mock("@/feature/serviceDesk/ticket/api/api", () => ({
  serviceDeskTicketApi: { get: mocks.ticket },
}));

import { useServiceDeskTicketQuery } from "../../ticket/api/queries";
import { useServiceDeskTicketActionListQuery, useServiceDeskTicketActionQuery } from "../../ticketAction/api/queries";
import { useServiceDeskTicketHistoryListQuery } from "../../ticketHistory/api/queries";

afterEach(cleanup);

describe("NOTE cache identity boundary", () => {
  it("removes the old operator's Action, History/recent-activity and capability data while requester queries are pending", async () => {
    const secret = { actionType: "NOTE", content: "internal secret" };
    mocks.effective = "operator";
    mocks.actions.mockResolvedValue([secret]);
    mocks.action.mockResolvedValue(secret);
    mocks.histories.mockResolvedValue([{ event: "NOTE_CREATED", metadata: { note: "internal secret" } }]);
    mocks.ticket.mockResolvedValue({ id: "t", canViewNote: true, canCreateNote: true });
    const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
    const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
    const { result, rerender, unmount } = renderHook(() => ({
      actions: useServiceDeskTicketActionListQuery("t"),
      action: useServiceDeskTicketActionQuery("t", "1"),
      histories: useServiceDeskTicketHistoryListQuery("t"),
      ticket: useServiceDeskTicketQuery("t"),
    }), { wrapper });
    await waitFor(() => expect(result.current.actions.data).toEqual([secret]));
    await waitFor(() => expect(result.current.histories.data).toHaveLength(1));
    const pending = new Promise(() => {});
    mocks.actions.mockReturnValue(pending);
    mocks.action.mockReturnValue(pending);
    mocks.histories.mockReturnValue(pending);
    mocks.ticket.mockReturnValue(pending);
    mocks.effective = "requester";
    act(() => rerender());
    expect(result.current.actions.data).toBeUndefined();
    expect(result.current.action.data).toBeUndefined();
    expect(result.current.histories.data).toBeUndefined();
    expect(result.current.ticket.data).toBeUndefined();
    unmount();
    client.clear();
  });
});
