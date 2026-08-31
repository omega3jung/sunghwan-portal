// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useEffect } from "react";
import type { UseFormReturn } from "react-hook-form";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { TicketDetail } from "@/domain/serviceDesk";

import type {
  TicketActionDraftFormValues,
  TicketActionPayloadValues,
} from "../../forms";
import type { TicketActionMode } from "../../types";
import { TicketActionTool } from "./TicketActionTool";

const workflowMocks = vi.hoisted(() => ({
  createAction: vi.fn(),
  prepareAttachments: vi.fn(),
  mutationToast: vi.fn(),
  useCurrentSession: vi.fn(),
  useTicketActionMutation: vi.fn(),
  editorReady: true,
  isPending: false,
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) =>
      key === "actionTool.autoComment.assignSelf"
        ? `Assigned to ${String(options?.name)} at ${String(options?.time)}`
        : key,
    i18n: { language: "en", resolvedLanguage: "en" },
  }),
}));

vi.mock("@/lib/client/i18n", () => ({
  useLocalizedText: () => (value: { en: string }) => value.en,
}));

vi.mock("@/feature/auth/session/client", () => ({
  useCurrentSession: workflowMocks.useCurrentSession,
}));

vi.mock("@/feature/serviceDesk/ticket/client", () => ({
  serviceDeskTicketApi: {
    prepareAttachments: workflowMocks.prepareAttachments,
  },
}));

vi.mock("@/lib/client/toast", () => ({
  useMutationToast: () => workflowMocks.mutationToast,
}));

vi.mock("../../api/client", () => ({
  useTicketActionMutation: workflowMocks.useTicketActionMutation,
}));

vi.mock("./TicketActionToolLauncher", () => ({
  TicketActionToolLauncher: ({
    hidden,
    isPending,
    onOpen,
  }: {
    hidden: boolean;
    isPending: boolean;
    onOpen: (mode: TicketActionMode) => void;
  }) =>
    hidden ? null : (
      <div>
        {(["comment", "approve", "adjust", "assignSelf"] as const).map(
          (mode) => (
            <button
              key={mode}
              type="button"
              disabled={isPending}
              onClick={() => onOpen(mode)}
            >
              open-{mode}
            </button>
          ),
        )}
      </div>
    ),
}));

vi.mock("./TicketActionToolHeader", () => ({
  TicketActionToolHeader: ({ mode }: { mode: TicketActionMode }) => (
    <div>header-{mode}</div>
  ),
}));

vi.mock("./TicketActionForm", () => ({
  TicketActionForm: ({
    mode,
    form,
    onEditorReady,
  }: {
    mode: TicketActionMode;
    form: UseFormReturn<TicketActionDraftFormValues>;
    onEditorReady: (editor: {
      commands: { focus: (position: string) => void };
    } | null) => void;
  }) => {
    useEffect(() => {
      onEditorReady(
        workflowMocks.editorReady
          ? { commands: { focus: vi.fn() } }
          : null,
      );
    }, [onEditorReady]);

    return (
      <div>
        <div>form-{mode}</div>
        <button
          type="button"
          onClick={() =>
            form.setValue("content", `${mode} content`, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
        >
          set-content
        </button>
        <button
          type="button"
          onClick={() =>
            form.setValue(
              "attachment",
              [new File(["raw"], "report.txt", { type: "text/plain" })],
              { shouldDirty: true },
            )
          }
        >
          attach-file
        </button>
      </div>
    );
  },
}));

vi.mock("./TicketActionToolFooter", () => ({
  TicketActionToolFooter: ({
    canSubmit,
    errorMessage,
    helperText,
    isPending,
    onCancel,
    onSubmit,
  }: {
    canSubmit: boolean;
    errorMessage: string;
    helperText: string;
    isPending: boolean;
    onCancel: () => void;
    onSubmit: () => void;
  }) => (
    <div>
      <span>{errorMessage || helperText}</span>
      <button type="button" disabled={isPending} onClick={onCancel}>
        cancel-draft
      </button>
      <button type="button" disabled={!canSubmit} onClick={onSubmit}>
        submit-action
      </button>
    </div>
  ),
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
    workAssigneeUsernames: ["agent-1", "agent-2"],
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

const preparedAttachments = {
  body: "Prepared content",
  files: [
    {
      originalName: "report.txt",
      replacedName: "demo-report.txt",
      extension: "txt" as const,
      size: 3,
      type: "text/plain",
      demoUrl: "/files/demo-report.txt",
      replaced: true as const,
      reason: "SECURITY_DEMO_REPLACEMENT" as const,
    },
  ],
  images: [],
};

beforeEach(() => {
  vi.clearAllMocks();
  workflowMocks.editorReady = true;
  workflowMocks.isPending = false;
  workflowMocks.useCurrentSession.mockReturnValue({
    current: {
      user: {
        id: "user-1",
        username: "agent-1",
        displayName: { en: "Agent <Admin>" },
        email: "agent@example.com",
        userScope: "INTERNAL",
        companyId: 1,
        permission: 1,
        canUseSuperUser: false,
        canUseImpersonation: false,
      },
    },
    data: { user: { dataScope: "REMOTE" } },
  });
  workflowMocks.useTicketActionMutation.mockImplementation(() => ({
    mutateAsync: workflowMocks.createAction,
    isPending: workflowMocks.isPending,
  }));
  workflowMocks.prepareAttachments.mockResolvedValue(preparedAttachments);
  workflowMocks.createAction.mockResolvedValue({ actionNo: "1" });
  workflowMocks.mutationToast.mockImplementation(
    async (promise: Promise<unknown>) => promise,
  );
});

describe("TicketActionTool workflow", () => {
  it("renders nothing until a ticket is available", () => {
    const { container } = render(<TicketActionTool ticketId="ticket-1" />);

    expect(container).toBeEmptyDOMElement();
  });

  it("opens an action draft and returns to the launcher after cancel", async () => {
    const user = userEvent.setup();
    render(<TicketActionTool ticketId="ticket-1" ticket={createTicket()} />);

    await user.click(screen.getByText("open-comment"));
    expect(screen.getByText("form-comment")).toBeInTheDocument();
    expect(screen.queryByText("open-comment")).not.toBeInTheDocument();

    await user.click(screen.getByText("cancel-draft"));
    expect(screen.queryByText("form-comment")).not.toBeInTheDocument();
    expect(screen.getByText("open-comment")).toBeInTheDocument();
  });

  it("submits approval without preparing attachments and closes the draft", async () => {
    const user = userEvent.setup();
    render(<TicketActionTool ticketId="ticket-1" ticket={createTicket()} />);

    await user.click(screen.getByText("open-approve"));
    await user.click(screen.getByText("set-content"));
    await user.click(screen.getByText("submit-action"));

    await waitFor(() => {
      expect(workflowMocks.createAction).toHaveBeenCalledWith({
        ticketId: "ticket-1",
        actionType: "APPROVE",
        values: expect.objectContaining({
          id: "user-1",
          actionType: "APPROVE",
          content: "approve content",
          files: [],
          images: [],
        }),
      });
    });
    expect(workflowMocks.prepareAttachments).not.toHaveBeenCalled();
    expect(screen.getByText("open-approve")).toBeInTheDocument();
  });

  it("prepares attachments before submitting a comment", async () => {
    const user = userEvent.setup();
    render(<TicketActionTool ticketId="ticket-1" ticket={createTicket()} />);

    await user.click(screen.getByText("open-comment"));
    await user.click(screen.getByText("set-content"));
    await user.click(screen.getByText("attach-file"));
    await user.click(screen.getByText("submit-action"));

    await waitFor(() => {
      expect(workflowMocks.prepareAttachments).toHaveBeenCalledWith({
        body: "comment content",
        files: [expect.objectContaining({ name: "report.txt" })],
      });
      expect(workflowMocks.createAction).toHaveBeenCalledWith({
        ticketId: "ticket-1",
        actionType: "COMMENT",
        values: expect.objectContaining<TicketActionPayloadValues>({
          id: "user-1",
          actionType: "COMMENT",
          content: "Prepared content",
          files: [
            {
              id: "demo-report.txt-3",
              name: "report.txt",
              size: 3,
              url: "/files/demo-report.txt",
            },
          ],
          images: [],
        }),
      });
    });
  });

  it("rejects an adjust submission when no ticket values changed", async () => {
    const user = userEvent.setup();
    render(<TicketActionTool ticketId="ticket-1" ticket={createTicket()} />);

    await user.click(screen.getByText("open-adjust"));
    await user.click(screen.getByText("set-content"));
    await user.click(screen.getByText("submit-action"));

    expect(
      await screen.findByText("actionTool.validation.adjustNoChanges"),
    ).toBeInTheDocument();
    expect(workflowMocks.prepareAttachments).not.toHaveBeenCalled();
    expect(workflowMocks.createAction).not.toHaveBeenCalled();
  });

  it("submits assign-to-me through the automatic action pipeline", async () => {
    const user = userEvent.setup();
    render(<TicketActionTool ticketId="ticket-1" ticket={createTicket()} />);

    await user.click(screen.getByText("open-assignSelf"));

    await waitFor(() => {
      expect(workflowMocks.prepareAttachments).toHaveBeenCalledWith({
        body: expect.stringContaining("Agent &lt;Admin&gt;"),
        files: [],
      });
      expect(workflowMocks.createAction).toHaveBeenCalledWith(
        expect.objectContaining({
          ticketId: "ticket-1",
          actionType: "ASSIGN_SELF",
        }),
      );
    });
    expect(screen.queryByText("form-assignSelf")).not.toBeInTheDocument();
  });

  it("blocks submit until the editor is ready", async () => {
    workflowMocks.editorReady = false;
    const user = userEvent.setup();
    render(<TicketActionTool ticketId="ticket-1" ticket={createTicket()} />);

    await user.click(screen.getByText("open-comment"));
    await user.click(screen.getByText("set-content"));

    expect(screen.getByText("submit-action")).toBeDisabled();
  });

  it("does not execute the workflow without a current user", async () => {
    workflowMocks.useCurrentSession.mockReturnValue({
      current: { user: null },
      data: { user: { dataScope: "REMOTE" } },
    });
    const user = userEvent.setup();
    render(<TicketActionTool ticketId="ticket-1" ticket={createTicket()} />);

    await user.click(screen.getByText("open-comment"));
    await user.click(screen.getByText("set-content"));
    await user.click(screen.getByText("submit-action"));

    expect(workflowMocks.prepareAttachments).not.toHaveBeenCalled();
    expect(workflowMocks.createAction).not.toHaveBeenCalled();
    expect(screen.getByText("form-comment")).toBeInTheDocument();
  });

  it("disables draft actions while the mutation is pending", async () => {
    const user = userEvent.setup();
    const ticket = createTicket();
    const { rerender } = render(
      <TicketActionTool ticketId="ticket-1" ticket={ticket} />,
    );

    await user.click(screen.getByText("open-comment"));
    workflowMocks.isPending = true;
    rerender(<TicketActionTool ticketId="ticket-1" ticket={ticket} />);

    expect(screen.getByText("submit-action")).toBeDisabled();
    expect(screen.getByText("cancel-draft")).toBeDisabled();
  });
});
