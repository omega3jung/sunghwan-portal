// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { TicketDetail } from "@/domain/serviceDesk";

import { TicketActionToolLauncher } from "./TicketActionToolLauncher";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

afterEach(cleanup);

function createTicket(
  overrides: Partial<TicketDetail> = {},
): TicketDetail {
  return {
    id: "ticket-1",
    ticketNumber: "SP-1",
    createdAt: "2026-08-01T00:00:00.000Z",
    requesterUsername: "requester",
    requester: {
      username: "requester",
      name: { en: { first: "Request", last: "User" } },
      email: "requester@example.com",
      image: null,
    },
    requesterDepartmentId: null,
    requesterDepartmentName: null,
    status: "Working",
    priority: "medium",
    riskLevel: "medium",
    assignmentPhase: "WORK",
    approvalAssignees: [],
    workAssignees: [],
    approvalAssigneeUsernames: [],
    workAssigneeUsernames: ["worker-1"],
    isCurrentApprover: false,
    isCurrentWorker: true,
    hasBeenWorker: true,
    workMinutes: 15,
    dueAt: "2026-09-01T00:00:00.000Z",
    owner: false,
    active: true,
    tenantId: "tenant-1",
    tenantName: { en: "Tenant" },
    scope: "INTERNAL",
    categoryId: "category-1",
    categoryName: { en: "Category" },
    approvalStepId: null,
    subject: "Printer issue",
    content: "Printer is unavailable",
    email: { to: [], cc: [], bcc: [] },
    files: [],
    images: [],
    mergedIntoTicketId: null,
    ...overrides,
  };
}

const actionLabel = (action: string) => {
  const specialLabels: Record<string, string> = {
    reopen: "action.reopenIssue",
    resubmit: "action.resubmitRequest",
    cancel: "action.cancelTicket",
  };

  return specialLabels[action] ?? `action.${action}`;
};

describe("TicketActionToolLauncher capability projection", () => {
  it("shows approval decisions to the current approver", () => {
    render(
      <TicketActionToolLauncher
        hidden={false}
        ticket={createTicket({
          status: "Approval",
          assignmentPhase: "APPROVAL",
          isCurrentApprover: true,
          isCurrentWorker: false,
        })}
        onOpen={vi.fn()}
      />,
    );

    expect(screen.getByText(actionLabel("approve"))).toBeInTheDocument();
    expect(screen.getByText(actionLabel("decline"))).toBeInTheDocument();
  });

  it("hides approval decisions from an unrelated user but allows admin override", () => {
    const ticket = createTicket({
      status: "Approval",
      assignmentPhase: "APPROVAL",
      isCurrentApprover: false,
      isCurrentWorker: false,
    });
    const { rerender } = render(
      <TicketActionToolLauncher
        hidden={false}
        ticket={ticket}
        onOpen={vi.fn()}
      />,
    );

    expect(screen.queryByText(actionLabel("approve"))).not.toBeInTheDocument();
    expect(screen.queryByText(actionLabel("decline"))).not.toBeInTheDocument();

    rerender(
      <TicketActionToolLauncher
        hidden={false}
        isAdmin
        ticket={ticket}
        onOpen={vi.fn()}
      />,
    );

    expect(screen.getByText(actionLabel("approve"))).toBeInTheDocument();
    expect(screen.getByText(actionLabel("decline"))).toBeInTheDocument();
  });

  it("projects worker-only actions and requires multiple assignees for assign-to-me", () => {
    const ticket = createTicket({
      workAssigneeUsernames: ["worker-1", "worker-2"],
    });
    const { rerender } = render(
      <TicketActionToolLauncher
        hidden={false}
        ticket={ticket}
        onOpen={vi.fn()}
      />,
    );

    expect(screen.getByText("action.assignToMe")).toBeInTheDocument();
    expect(screen.getByText(actionLabel("reject"))).toBeInTheDocument();
    expect(screen.getByText(actionLabel("merge"))).toBeInTheDocument();

    rerender(
      <TicketActionToolLauncher
        hidden={false}
        ticket={createTicket()}
        onOpen={vi.fn()}
      />,
    );

    expect(screen.queryByText("action.assignToMe")).not.toBeInTheDocument();
  });

  it("honors the caller's assignment capability", () => {
    render(
      <TicketActionToolLauncher
        hidden={false}
        canAssign={false}
        ticket={createTicket()}
        onOpen={vi.fn()}
      />,
    );

    expect(screen.queryByText(actionLabel("assign"))).not.toBeInTheDocument();
  });

  it.each([
    ["Resolved", "reopen"],
    ["Declined", "resubmit"],
    ["Rejected", "cancel"],
  ] as const)(
    "shows %s ownership actions only to the owner",
    (status, action) => {
      const ticket = createTicket({
        status,
        owner: false,
        isCurrentWorker: false,
      });
      const { rerender } = render(
        <TicketActionToolLauncher
          hidden={false}
          ticket={ticket}
          onOpen={vi.fn()}
        />,
      );

      expect(screen.queryByText(actionLabel(action))).not.toBeInTheDocument();

      rerender(
        <TicketActionToolLauncher
          hidden={false}
          ticket={{ ...ticket, owner: true }}
          onOpen={vi.fn()}
        />,
      );

      expect(screen.getByText(actionLabel(action))).toBeInTheDocument();
    },
  );

  it("hides merge after the ticket has already been merged", () => {
    render(
      <TicketActionToolLauncher
        hidden={false}
        ticket={createTicket({ mergedIntoTicketId: "target-ticket" })}
        onOpen={vi.fn()}
      />,
    );

    expect(screen.queryByText(actionLabel("merge"))).not.toBeInTheDocument();
  });

  it("does not expose comment or note for a closed ticket", () => {
    render(
      <TicketActionToolLauncher
        hidden={false}
        isAdmin
        ticket={createTicket({ status: "Closed" })}
        onOpen={vi.fn()}
      />,
    );

    expect(screen.queryByText(actionLabel("comment"))).not.toBeInTheDocument();
    expect(screen.queryByText(actionLabel("note"))).not.toBeInTheDocument();
  });

  it("hides the launcher while a draft is open and disables actions while pending", async () => {
    const onOpen = vi.fn();
    const { rerender } = render(
      <TicketActionToolLauncher
        hidden
        ticket={createTicket()}
        onOpen={onOpen}
      />,
    );

    expect(screen.queryByRole("button")).not.toBeInTheDocument();

    rerender(
      <TicketActionToolLauncher
        hidden={false}
        isPending
        ticket={createTicket()}
        onOpen={onOpen}
      />,
    );

    const commentButton = screen.getByText(actionLabel("comment")).closest("button");
    expect(commentButton).toBeDisabled();

    await userEvent.setup().click(commentButton!);
    expect(onOpen).not.toHaveBeenCalled();
  });
});
