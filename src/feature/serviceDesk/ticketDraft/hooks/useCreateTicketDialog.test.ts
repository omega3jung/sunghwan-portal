// @vitest-environment jsdom

import { cleanup, fireEvent, render, renderHook, screen, waitFor } from "@testing-library/react";
import { act, createElement, type ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { TicketFormValues } from "@/feature/serviceDesk/ticket/forms";

import { CreateTicketDialogFooter } from "../components/CreateTicketDialog/CreateTicketDialogFooter";
import { useCreateTicketDialog } from "./useCreateTicketDialog";

const dialogMocks = vi.hoisted(() => ({
  createTicket: vi.fn(),
  getValues: vi.fn(),
  mutationToast: vi.fn(),
  removeDraft: vi.fn(),
  clearDraft: vi.fn(),
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
  category: "10",
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

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

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
    clearDraft: dialogMocks.clearDraft,
  });
  dialogMocks.createTicket.mockResolvedValue({ id: "ticket-1" });
  dialogMocks.saveDraftNow.mockResolvedValue(null);
  dialogMocks.removeDraft.mockResolvedValue(undefined);
  dialogMocks.mutationToast.mockImplementation(
    // Base UI returns a new promise which rejects after displaying its error toast.
    (promise: Promise<unknown>) => promise.then((value) => value),
  );
});

describe("useCreateTicketDialog workflow", () => {
  it.each(["LOCAL", "REMOTE"])("warns once per opening, then closes without saving categoryless edits in %s mode", async (dataScope) => {
    dialogMocks.isDirty = true;
    dialogMocks.getValues.mockReturnValue({ ...formValues, category: undefined });
    dialogMocks.useCurrentSession.mockReturnValue({ current: { user: null }, data: { user: { dataScope } } });
    const { result } = renderHook(() => useCreateTicketDialog({ language: "en", categories: [] }));
    await act(async () => { await result.current.handleOpenChange(true); });
    dialogMocks.resetForm.mockClear();
    await act(async () => { await result.current.handleOpenChange(false); });
    expect(result.current.open).toBe(true);
    expect(dialogMocks.resetForm).not.toHaveBeenCalled();
    expect(dialogMocks.saveDraftNow).not.toHaveBeenCalled();
    expect(dialogMocks.mutationToast).not.toHaveBeenCalled();
    expect(dialogMocks.toastAdd).toHaveBeenCalledWith(expect.objectContaining({ title: "ticketDraft.categoryRequired", type: "warning" }));
    await act(async () => { await result.current.handleOpenChange(false); });
    expect(result.current.open).toBe(false);
    expect(dialogMocks.saveDraftNow).not.toHaveBeenCalled();
    expect(dialogMocks.removeDraft).not.toHaveBeenCalled();
    expect(dialogMocks.mutationToast).not.toHaveBeenCalled();
    expect(dialogMocks.toastAdd).toHaveBeenCalledOnce();
    await act(async () => { await result.current.handleOpenChange(true); });
    await act(async () => { await result.current.handleOpenChange(false); });
    expect(result.current.open).toBe(true);
    expect(dialogMocks.toastAdd).toHaveBeenCalledTimes(2);
  });

  it("saves normally if a category is selected after the first close warning", async () => {
    dialogMocks.isDirty = true;
    dialogMocks.getValues.mockReturnValue({ ...formValues, category: undefined });
    const { result } = renderHook(() => useCreateTicketDialog({ language: "en", categories: [] }));
    await act(async () => result.current.handleOpenChange(true));
    await act(async () => result.current.handleOpenChange(false));
    dialogMocks.getValues.mockReturnValue(formValues);
    await act(async () => result.current.handleOpenChange(false));
    expect(dialogMocks.saveDraftNow).toHaveBeenCalledOnce();
    expect(result.current.open).toBe(false);
  });

  it("allows retry after discard rejects through the toast promise without clearing the draft", async () => {
    dialogMocks.removeDraft.mockRejectedValueOnce(new Error("Request failed with status code 500"));
    dialogMocks.useTicketDraft.mockReturnValue({ ticketDraft: formValues, removeDraft: dialogMocks.removeDraft });
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const { result } = renderHook(() => useCreateTicketDialog({ language: "en", categories: [] }));
    await act(async () => result.current.handleOpenChange(true));
    const notification = dialogMocks.toastAdd.mock.calls.find(([options]) => options.id === "service-desk-ticket-draft")![0];
    const consoleError = vi.spyOn(console, "error");
    // ToastPrimitive.Description renders a paragraph. Exercise the actual
    // description markup inside that element to catch invalid DOM nesting.
    render(createElement("p", null, notification.description as ReactNode));
    render(createElement("button", notification.data.secondaryActionProps));
    expect(consoleError).not.toHaveBeenCalled();
    dialogMocks.toastClose.mockClear();
    dialogMocks.resetForm.mockClear();
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: "ticketDraft.discard" })); });
    expect(dialogMocks.removeDraft).toHaveBeenCalledOnce();
    expect(dialogMocks.toastClose).not.toHaveBeenCalled();
    expect(dialogMocks.resetForm).not.toHaveBeenCalled();
    expect(result.current.open).toBe(true);
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: "ticketDraft.discard" })); });
    expect(dialogMocks.removeDraft).toHaveBeenCalledTimes(2);
    expect(dialogMocks.toastClose).toHaveBeenCalledWith("service-desk-ticket-draft");
  });

  it("restores a category-only draft with empty string fields", async () => {
    dialogMocks.useTicketDraft.mockReturnValue({ ticketDraft: { ...formValues, subject: "", body: "", dueAt: new Date("2099-01-01") } });
    const { result } = renderHook(() => useCreateTicketDialog({ language: "en", categories: [] }));
    await act(async () => { await result.current.handleOpenChange(true); });
    const draftToast = dialogMocks.toastAdd.mock.calls.find(([value]) => value.id === "service-desk-ticket-draft")?.[0];
    expect(draftToast).toBeDefined();
    await act(async () => { draftToast.actionProps.onClick(); });
    expect(dialogMocks.resetForm).toHaveBeenLastCalledWith(expect.objectContaining({ category: "10", subject: "", body: "" }));
  });

  it.each(["", "<p></p>", "<p><br></p>", "<p>&nbsp;</p>"])("does not advance semantically empty body %s", (body) => {
    dialogMocks.watchValues = ["10", "Subject", body];
    const { result } = renderHook(() => useCreateTicketDialog({ language: "en", categories: [] }));
    expect(result.current.canMoveNext).toBe(false);
  });

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

    dialogMocks.watchValues = ["10", " Printer ", " Details "];
    rerender();

    expect(result.current.canMoveNext).toBe(true);
  });

  it.each([
    ["REMOTE", false],
    ["LOCAL", true],
  ] as const)(
    "submits the review in %s mode and removes only a LOCAL draft",
    async (dataScope, shouldRemoveDraft) => {
      dialogMocks.watchValues = ["10", "Printer", "Details"];
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
      expect(dialogMocks.clearDraft).toHaveBeenCalledTimes(shouldRemoveDraft ? 0 : 1);
      expect(result.current.isSubmitting).toBe(false);
    },
  );

  it("keeps the dialog open when ticket creation fails", async () => {
    dialogMocks.watchValues = ["10", "Printer", "Details"];
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
    expect(dialogMocks.mutationToast).toHaveBeenCalledWith(expect.any(Promise), "save", "field.draft");
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

  it.each(["success", "failure"])("blocks repeated submit, close and navigation while pending, then releases on %s", async (outcome) => {
    let resolve!: (value: unknown) => void;
    let reject!: (error: Error) => void;
    dialogMocks.createTicket.mockReturnValueOnce(new Promise((res, rej) => { resolve = res; reject = rej; }));
    dialogMocks.isDirty = true;
    const { result } = renderHook(() => useCreateTicketDialog({ language: "en", categories: [] }));
    await act(async () => result.current.handleOpenChange(true));
    act(() => result.current.setCurrentStep(2));
    act(() => { result.current.moveToNext(); result.current.moveToNext(); });
    expect(result.current.isSubmitting).toBe(true);
    expect(result.current.canMoveNext).toBe(false);
    await act(async () => result.current.handleOpenChange(false));
    act(() => { result.current.moveToBack(); result.current.setCurrentStep(0); });
    expect(result.current.currentStep).toBe(2);
    expect(result.current.open).toBe(true);
    expect(dialogMocks.saveDraftNow).not.toHaveBeenCalled();
    expect(dialogMocks.createTicket).toHaveBeenCalledOnce();
    await act(async () => { if (outcome === "success") resolve({ id: "ticket" }); else reject(new Error("failed")); });
    expect(result.current.isSubmitting).toBe(false);
    if (outcome === "failure") {
      expect(result.current.open).toBe(true);
      act(() => result.current.moveToNext());
      await waitFor(() => expect(result.current.open).toBe(false));
      expect(dialogMocks.createTicket).toHaveBeenCalledTimes(2);
    } else {
      expect(result.current.open).toBe(false);
    }
  });

  it("does not reopen or submit while a draft save is pending", async () => {
    let resolve!: (value: null) => void;
    dialogMocks.isDirty = true;
    dialogMocks.saveDraftNow.mockReturnValueOnce(new Promise<null>((res) => { resolve = res; }));
    const { result } = renderHook(() => useCreateTicketDialog({ language: "en", categories: [] }));
    await act(async () => result.current.handleOpenChange(true));
    act(() => result.current.setCurrentStep(2));
    let closing!: Promise<void>;
    act(() => { closing = result.current.handleOpenChange(false); });
    await act(async () => result.current.handleOpenChange(true));
    act(() => result.current.moveToNext());
    expect(result.current.open).toBe(false);
    expect(dialogMocks.createTicket).not.toHaveBeenCalled();
    await act(async () => { resolve(null); await closing; });
    await act(async () => result.current.handleOpenChange(true));
    expect(result.current.open).toBe(true);
  });

  it("disables submit and back buttons while submission is pending", () => {
    const onNext = vi.fn();
    const onBack = vi.fn();
    render(createElement(CreateTicketDialogFooter, { currentStep: 2, canMoveNext: true, isSubmitting: true, onNext, onBack }));
    fireEvent.click(screen.getByRole("button", { name: "action.submit" }));
    fireEvent.click(screen.getByRole("button", { name: "action.back" }));
    expect(onNext).not.toHaveBeenCalled();
    expect(onBack).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "action.submit" }).getAttribute("aria-busy")).toBe("true");
  });

  it("keeps editor content available when draft preparation or persistence fails", async () => {
    dialogMocks.isDirty = true;
    dialogMocks.saveDraftNow.mockRejectedValueOnce(new Error("Preparation failed"));
    const { result } = renderHook(() => useCreateTicketDialog({ language: "en", categories: [] }));
    await act(async () => result.current.handleOpenChange(true));
    dialogMocks.resetForm.mockClear();
    await act(async () => result.current.handleOpenChange(false));
    expect(result.current.open).toBe(true);
    expect(dialogMocks.resetForm).not.toHaveBeenCalled();
    await act(async () => result.current.handleOpenChange(false));
    expect(result.current.open).toBe(false);
  });

  it("does not erase edits made while confirmed draft discard is pending", async () => {
    let resolve!: () => void;
    dialogMocks.removeDraft.mockReturnValueOnce(new Promise<void>((res) => { resolve = res; }));
    dialogMocks.useTicketDraft.mockReturnValue({ ticketDraft: formValues, removeDraft: dialogMocks.removeDraft });
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const { result, rerender } = renderHook(() => useCreateTicketDialog({ language: "en", categories: [] }));
    await act(async () => result.current.handleOpenChange(true));
    const notification = dialogMocks.toastAdd.mock.calls.find(([options]) => options.id === "service-desk-ticket-draft")![0];
    render(createElement("button", notification.data.secondaryActionProps));
    fireEvent.click(screen.getByRole("button", { name: "ticketDraft.discard" }));
    dialogMocks.resetForm.mockClear();
    dialogMocks.isDirty = true;
    rerender();
    await act(async () => { resolve(); });
    expect(dialogMocks.resetForm).not.toHaveBeenCalled();
  });

  it("offers confirmed draft discard alongside load, preserving the draft on cancel", async () => {
    dialogMocks.useTicketDraft.mockReturnValue({ ticketDraft: formValues, removeDraft: dialogMocks.removeDraft, clearDraft: dialogMocks.clearDraft });
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    const { result } = renderHook(() => useCreateTicketDialog({ language: "en", categories: [] }));
    await act(async () => result.current.handleOpenChange(true));
    const notification = dialogMocks.toastAdd.mock.calls.find(([options]) => options.id === "service-desk-ticket-draft")![0];
    expect(notification.actionProps.children).toBe("action.load");
    render(createElement("button", notification.data.secondaryActionProps));
    fireEvent.click(screen.getByRole("button", { name: "ticketDraft.discard" }));
    expect(dialogMocks.removeDraft).not.toHaveBeenCalled();
    confirm.mockReturnValue(true);
    fireEvent.click(screen.getByRole("button", { name: "ticketDraft.discard" }));
    await waitFor(() => expect(dialogMocks.removeDraft).toHaveBeenCalledOnce());
    expect(dialogMocks.toastClose).toHaveBeenCalledWith("service-desk-ticket-draft");
    expect(dialogMocks.resetForm).toHaveBeenLastCalledWith(expect.objectContaining({ id: null, subject: "", body: "" }));
  });
});
