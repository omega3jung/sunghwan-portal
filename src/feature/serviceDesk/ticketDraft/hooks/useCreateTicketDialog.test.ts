// @vitest-environment jsdom

import { cleanup, renderHook, waitFor } from "@testing-library/react";
import { act } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { TicketFormValues } from "@/feature/serviceDesk/ticket/forms";

import { useCreateTicketDialog } from "./useCreateTicketDialog";

const dialogMocks = vi.hoisted(() => ({
  createTicket: vi.fn(),
  getValues: vi.fn(),
  mutationToast: vi.fn(),
  removeDraft: vi.fn(),
  resetForm: vi.fn(),
  saveDraftNow: vi.fn(),
  toastAdd: vi.fn(),
  toastClose: vi.fn(),
  useCurrentSession: vi.fn(),
  useTicketDraft: vi.fn(),
  isDirty: false,
  watchValues: [undefined, "", ""] as [string | undefined, string, string],
}));

const formValues: TicketFormValues = {
  id: null,
  category: "category-1",
  subject: "Printer issue",
  body: "Please investigate",
  dueAt: new Date("2026-09-10T00:00:00.000Z"),
  priority: "medium",
  riskLevel: "medium",
  email: { to: [], cc: [], bcc: [] },
  requester: { id: "agent-1", email: "agent@example.com", name: "Agent" },
  attachment: [],
};

vi.mock("react-hook-form", async (importOriginal) => {
  const original = await importOriginal<typeof import("react-hook-form")>();

  return {
    ...original,
    useWatch: () => dialogMocks.watchValues,
  };
});

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("@/components/ui/toast", () => ({
  toast: {
    add: dialogMocks.toastAdd,
    close: dialogMocks.toastClose,
  },
}));

vi.mock("@/feature/auth/session/client", () => ({
  useCurrentSession: dialogMocks.useCurrentSession,
}));

vi.mock("@/feature/serviceDesk/ticket/client", () => ({
  useCreateServiceDeskTicket: () => ({ mutateAsync: dialogMocks.createTicket }),
  useTicketForm: () => ({
    control: {},
    getValues: dialogMocks.getValues,
    reset: dialogMocks.resetForm,
    formState: { isDirty: dialogMocks.isDirty },
  }),
}));

vi.mock("@/lib/client/i18n", () => ({
  useLocalizedText: () => (value: { en: string }) => value.en,
}));

vi.mock("@/lib/client/toast", () => ({
  useMutationToast: () => dialogMocks.mutationToast,
}));

vi.mock("../../approvalStep/client", () => ({
  useServiceDeskApprovalStepListQuery: () => ({ data: [] }),
}));

vi.mock("./useTicketDraft", () => ({
  useTicketDraft: dialogMocks.useTicketDraft,
}));

afterEach(cleanup);

beforeEach(() => {
  vi.clearAllMocks();
  dialogMocks.isDirty = false;
  dialogMocks.watchValues = [undefined, "", ""];
  dialogMocks.getValues.mockReturnValue(formValues);
  dialogMocks.useCurrentSession.mockReturnValue({
    current: {
      user: {
        username: "agent-1",
        email: "agent@example.com",
        displayName: { en: "Agent" },
      },
    },
    data: { user: { dataScope: "REMOTE" } },
  });
  dialogMocks.useTicketDraft.mockReturnValue({
    ticketDraft: null,
    saveDraftNow: dialogMocks.saveDraftNow,
    removeDraft: dialogMocks.removeDraft,
  });
  dialogMocks.createTicket.mockResolvedValue({ id: "ticket-1" });
  dialogMocks.saveDraftNow.mockResolvedValue(null);
  dialogMocks.removeDraft.mockResolvedValue(undefined);
  dialogMocks.mutationToast.mockImplementation(
    async (promise: Promise<unknown>) => promise,
  );
});

describe("useCreateTicketDialog workflow", () => {
  it("opens at the info step with the current requester defaults", async () => {
    const { result } = renderHook(() =>
      useCreateTicketDialog({ language: "en", categories: [] }),
    );

    await act(async () => {
      await result.current.handleOpenChange(true);
    });

    expect(result.current.open).toBe(true);
    expect(result.current.currentStep).toBe(0);
    expect(dialogMocks.resetForm).toHaveBeenCalledWith(
      expect.objectContaining({
        requester: {
          id: "agent-1",
          email: "agent@example.com",
          name: "Agent",
        },
      }),
    );
  });

  it("derives info-step progression from category, subject, and body", () => {
    const { result, rerender } = renderHook(() =>
      useCreateTicketDialog({ language: "en", categories: [] }),
    );

    expect(result.current.canMoveNext).toBe(false);

    dialogMocks.watchValues = ["category-1", " Printer ", " Details "];
    rerender();

    expect(result.current.canMoveNext).toBe(true);
  });

  it.each([
    ["REMOTE", false],
    ["LOCAL", true],
  ] as const)(
    "submits the review in %s mode and removes only a LOCAL draft",
    async (dataScope, shouldRemoveDraft) => {
      dialogMocks.watchValues = ["category-1", "Printer", "Details"];
      dialogMocks.useCurrentSession.mockReturnValue({
        current: {
          user: {
            username: "agent-1",
            email: "agent@example.com",
            displayName: { en: "Agent" },
          },
        },
        data: { user: { dataScope } },
      });
      const { result } = renderHook(() =>
        useCreateTicketDialog({ language: "en", categories: [] }),
      );

      await act(async () => result.current.handleOpenChange(true));
      act(() => result.current.moveToNext());
      act(() => result.current.moveToNext());
      act(() => result.current.moveToNext());

      await waitFor(() => {
        expect(dialogMocks.createTicket).toHaveBeenCalledWith(formValues);
        expect(result.current.open).toBe(false);
      });
      expect(dialogMocks.removeDraft).toHaveBeenCalledTimes(
        shouldRemoveDraft ? 1 : 0,
      );
    },
  );

  it("keeps the dialog open when ticket creation fails", async () => {
    dialogMocks.watchValues = ["category-1", "Printer", "Details"];
    dialogMocks.createTicket.mockRejectedValue(new Error("create failed"));
    const { result } = renderHook(() =>
      useCreateTicketDialog({ language: "en", categories: [] }),
    );

    await act(async () => result.current.handleOpenChange(true));
    act(() => result.current.moveToNext());
    act(() => result.current.moveToNext());
    act(() => result.current.moveToNext());

    await waitFor(() => expect(dialogMocks.createTicket).toHaveBeenCalled());
    expect(result.current.open).toBe(true);
    expect(dialogMocks.removeDraft).not.toHaveBeenCalled();
  });

  it("saves meaningful dirty state when the dialog closes", async () => {
    dialogMocks.isDirty = true;
    dialogMocks.saveDraftNow.mockResolvedValue({ id: "draft-1" });
    const { result } = renderHook(() =>
      useCreateTicketDialog({ language: "en", categories: [] }),
    );

    await act(async () => result.current.handleOpenChange(true));
    await act(async () => result.current.handleOpenChange(false));

    expect(dialogMocks.saveDraftNow).toHaveBeenCalledOnce();
    expect(dialogMocks.toastAdd).toHaveBeenCalledWith(
      expect.objectContaining({ type: "success" }),
    );
    expect(result.current.open).toBe(false);
  });

  it("offers restoration only before the user edits the opened form", async () => {
    dialogMocks.useTicketDraft.mockReturnValue({
      ticketDraft: formValues,
      saveDraftNow: dialogMocks.saveDraftNow,
      removeDraft: dialogMocks.removeDraft,
    });
    const { result } = renderHook(() =>
      useCreateTicketDialog({ language: "en", categories: [] }),
    );

    await act(async () => result.current.handleOpenChange(true));

    await waitFor(() => {
      expect(dialogMocks.toastAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "service-desk-ticket-draft",
          actionProps: expect.objectContaining({ onClick: expect.any(Function) }),
        }),
      );
    });
    const restorationToast = dialogMocks.toastAdd.mock.calls.find(
      ([options]) => options.id === "service-desk-ticket-draft",
    )?.[0] as { actionProps: { onClick: () => void } };

    act(() => restorationToast.actionProps.onClick());

    expect(dialogMocks.resetForm).toHaveBeenLastCalledWith(formValues);
    expect(dialogMocks.toastClose).toHaveBeenCalledWith(
      "service-desk-ticket-draft",
    );
  });
});
