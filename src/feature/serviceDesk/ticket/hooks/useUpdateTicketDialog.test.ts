// @vitest-environment jsdom

import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { addMonths } from "date-fns";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type {
  TicketAttachmentMetadata,
  TicketDetail,
} from "@/domain/serviceDesk";

import { useUpdateTicketDialog } from "./useUpdateTicketDialog";

const dialogMocks = vi.hoisted(() => ({
  getTicket: vi.fn(),
  mutationToast: vi.fn(),
  prepareAttachments: vi.fn(),
  updateTicket: vi.fn(),
  useCurrentSession: vi.fn(),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("@/feature/auth/session/client", () => ({
  useCurrentSession: dialogMocks.useCurrentSession,
}));

vi.mock("@/feature/serviceDesk/ticket/api/client", () => ({
  serviceDeskTicketApi: {
    get: dialogMocks.getTicket,
    prepareAttachments: dialogMocks.prepareAttachments,
  },
  useRequesterUpdateServiceDeskTicket: () => ({
    mutateAsync: dialogMocks.updateTicket,
    isPending: false,
  }),
}));

vi.mock("@/feature/user/preference/client", () => ({
  useCurrentPreference: () => ({ current: { language: "en" } }),
}));

vi.mock("@/lib/client/i18n", () => ({
  useLocalizedValue: () => (value: { en: unknown }) => value.en,
}));

vi.mock("@/lib/client/toast", () => ({
  useMutationToast: () => dialogMocks.mutationToast,
}));

afterEach(cleanup);

const existingFile: TicketAttachmentMetadata = {
  originalName: "existing.pdf",
  replacedName: "demo-existing.pdf",
  extension: "pdf",
  size: 20,
  type: "application/pdf",
  demoUrl: "/files/demo-existing.pdf",
  replaced: true,
  reason: "SECURITY_DEMO_REPLACEMENT",
};

const existingImage: TicketAttachmentMetadata = {
  originalName: "existing.png",
  replacedName: "demo-existing.png",
  extension: "png",
  size: 10,
  type: "image/png",
  demoUrl: "/files/demo-existing.png",
  replaced: true,
  reason: "SECURITY_DEMO_REPLACEMENT",
};

const futureDueAtISOString = addMonths(new Date(), 1).toISOString();

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
    workAssigneeUsernames: ["agent-1"],
    isCurrentApprover: false,
    isCurrentWorker: true,
    hasBeenWorker: true,
    workMinutes: 15,
    dueAt: futureDueAtISOString,
    owner: true,
    active: true,
    tenantId: "tenant-1",
    tenantName: { en: "Tenant" },
    scope: "PORTAL",
    categoryId: "category-1",
    categoryName: { en: "Category" },
    approvalStepId: null,
    subject: " Printer issue ",
    content: " Printer is unavailable ",
    email: { to: [], cc: [], bcc: [] },
    files: [existingFile],
    images: [existingImage],
    mergedIntoTicketId: null,
    ...overrides,
  };
}

const preparedFile: TicketAttachmentMetadata = {
  ...existingFile,
  originalName: "new.pdf",
  replacedName: "demo-new.pdf",
  demoUrl: "/files/demo-new.pdf",
};

const preparedImage: TicketAttachmentMetadata = {
  ...existingImage,
  originalName: "new.png",
  replacedName: "demo-new.png",
  demoUrl: "/files/demo-new.png",
};

beforeEach(() => {
  vi.clearAllMocks();
  dialogMocks.useCurrentSession.mockReturnValue({
    data: { user: { dataScope: "REMOTE" } },
  });
  dialogMocks.getTicket.mockResolvedValue(createTicket());
  dialogMocks.prepareAttachments.mockResolvedValue({
    body: " Prepared body ",
    files: [preparedFile],
    images: [preparedImage],
  });
  dialogMocks.updateTicket.mockResolvedValue(createTicket());
  dialogMocks.mutationToast.mockImplementation(
    (promise: Promise<unknown>) => {
      void promise.catch(() => undefined);
      return promise;
    },
  );
});

describe("useUpdateTicketDialog workflow", () => {
  it("loads a fresh ticket and initializes editable and retained attachments", async () => {
    const { result } = renderHook(() =>
      useUpdateTicketDialog({ ticketId: "ticket-1" }),
    );

    act(() => result.current.handleOpenChange(true));

    await waitFor(() => expect(result.current.ticket?.id).toBe("ticket-1"));
    expect(result.current.open).toBe(true);
    expect(result.current.isLoadingTicket).toBe(false);
    expect(result.current.ticketForm.getValues()).toEqual(
      expect.objectContaining({
        id: "ticket-1",
        category: "category-1",
        subject: " Printer issue ",
        requester: {
          id: "requester",
          email: "requester@example.com",
          name: "Request User",
        },
        attachment: [],
      }),
    );
    expect(result.current.existingFiles).toEqual([existingFile]);
    expect(result.current.existingImages).toEqual([existingImage]);
  });

  it("exposes a load error without entering the workflow", async () => {
    dialogMocks.getTicket.mockRejectedValue(new Error("load failed"));
    const { result } = renderHook(() =>
      useUpdateTicketDialog({ ticketId: "ticket-1" }),
    );

    act(() => result.current.handleOpenChange(true));

    await waitFor(() => {
      expect(result.current.loadError).toBe("ticketUpdate.error.load");
    });
    expect(result.current.ticket).toBeNull();
    expect(result.current.isLoadingTicket).toBe(false);
  });

  it("ignores a late load after the dialog has closed", async () => {
    let resolveTicket: ((ticket: TicketDetail) => void) | undefined;
    dialogMocks.getTicket.mockReturnValue(
      new Promise<TicketDetail>((resolve) => {
        resolveTicket = resolve;
      }),
    );
    const { result } = renderHook(() =>
      useUpdateTicketDialog({ ticketId: "ticket-1" }),
    );

    act(() => result.current.handleOpenChange(true));
    act(() => result.current.handleOpenChange(false));
    await act(async () => resolveTicket?.(createTicket()));

    expect(result.current.open).toBe(false);
    expect(result.current.ticket).toBeNull();
    expect(result.current.existingFiles).toEqual([]);
  });

  it("prepares new attachments, combines retained metadata, and closes after success", async () => {
    const { result } = renderHook(() =>
      useUpdateTicketDialog({ ticketId: "ticket-1" }),
    );

    act(() => result.current.handleOpenChange(true));
    await waitFor(() => expect(result.current.ticket).not.toBeNull());
    act(() => result.current.removeExistingFile(0));

    await act(async () => result.current.moveToNext());
    await act(async () => result.current.moveToNext());
    await act(async () => result.current.moveToNext());

    await waitFor(() => {
      expect(dialogMocks.prepareAttachments).toHaveBeenCalledWith({
        body: " Printer is unavailable ",
        files: [],
      });
      expect(dialogMocks.updateTicket).toHaveBeenCalledWith({
        ticketId: "ticket-1",
        data: {
          categoryId: "category-1",
          subject: "Printer issue",
          content: "Prepared body",
          dueAt: futureDueAtISOString,
          email: { to: [], cc: [], bcc: [] },
          files: [preparedFile],
          images: [existingImage, preparedImage],
        },
      });
      expect(result.current.open).toBe(false);
    });
  });

  it("keeps the loaded dialog open when update fails", async () => {
    dialogMocks.updateTicket.mockRejectedValue(new Error("update failed"));
    const { result } = renderHook(() =>
      useUpdateTicketDialog({ ticketId: "ticket-1" }),
    );

    act(() => result.current.handleOpenChange(true));
    await waitFor(() => expect(result.current.ticket).not.toBeNull());
    await act(async () => result.current.moveToNext());
    await act(async () => result.current.moveToNext());
    await act(async () => result.current.moveToNext());

    await waitFor(() => expect(dialogMocks.updateTicket).toHaveBeenCalled());
    expect(result.current.open).toBe(true);
    expect(result.current.ticket?.id).toBe("ticket-1");
  });
});
