// @vitest-environment jsdom

import { cleanup, renderHook } from "@testing-library/react";
import { act } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { TicketDetail } from "@/domain/serviceDesk";

import { useAutoStartAssignedTicketOnView } from "./useAutoStartAssignedTicketOnView";

const mutationMock = vi.hoisted(() => ({
  mutate: vi.fn(),
  isPending: false,
}));

vi.mock("../api/mutations", () => ({
  useStartTicketWorkMutation: () => ({
    mutate: mutationMock.mutate,
    isPending: mutationMock.isPending,
  }),
}));

afterEach(cleanup);

beforeEach(() => {
  vi.clearAllMocks();
  mutationMock.isPending = false;
});

function createTicket(
  overrides: Partial<TicketDetail> = {},
): TicketDetail {
  return {
    id: "ticket-1",
    active: true,
    status: "Assigned",
    assignmentPhase: "WORK",
    isCurrentWorker: true,
    ...overrides,
  } as TicketDetail;
}

describe("useAutoStartAssignedTicketOnView", () => {
  it("starts an active Assigned ticket for its current WORK-phase worker once", () => {
    const ticket = createTicket();
    const { rerender } = renderHook(
      ({ currentTicket }) =>
        useAutoStartAssignedTicketOnView({ ticket: currentTicket }),
      { initialProps: { currentTicket: ticket } },
    );

    expect(mutationMock.mutate).toHaveBeenCalledOnce();
    expect(mutationMock.mutate).toHaveBeenCalledWith(
      { ticketId: "ticket-1" },
      expect.objectContaining({ onError: expect.any(Function) }),
    );

    rerender({ currentTicket: { ...ticket } });
    expect(mutationMock.mutate).toHaveBeenCalledOnce();
  });

  it.each([
    ["inactive", { active: false }],
    ["already working", { status: "Working" as const }],
    ["approval phase", { assignmentPhase: "APPROVAL" as const }],
    ["unrelated user", { isCurrentWorker: false }],
  ])("does not auto-start an %s ticket", (_, overrides) => {
    renderHook(() =>
      useAutoStartAssignedTicketOnView({
        ticket: createTicket(overrides),
      }),
    );

    expect(mutationMock.mutate).not.toHaveBeenCalled();
  });

  it("allows a failed start command to retry when pending returns to false", () => {
    const ticket = createTicket();
    const { rerender } = renderHook(
      ({ currentTicket }) =>
        useAutoStartAssignedTicketOnView({ ticket: currentTicket }),
      { initialProps: { currentTicket: ticket } },
    );
    const options = mutationMock.mutate.mock.calls[0][1] as {
      onError: () => void;
    };

    mutationMock.isPending = true;
    rerender({ currentTicket: ticket });
    act(() => options.onError());
    mutationMock.isPending = false;
    rerender({ currentTicket: ticket });

    expect(mutationMock.mutate).toHaveBeenCalledTimes(2);
  });

  it("starts again when navigation selects a different eligible ticket", () => {
    const { rerender } = renderHook(
      ({ ticket }) => useAutoStartAssignedTicketOnView({ ticket }),
      { initialProps: { ticket: createTicket() } },
    );

    rerender({ ticket: createTicket({ id: "ticket-2" }) });

    expect(mutationMock.mutate).toHaveBeenNthCalledWith(
      2,
      { ticketId: "ticket-2" },
      expect.objectContaining({ onError: expect.any(Function) }),
    );
  });
});
