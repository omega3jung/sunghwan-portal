// @vitest-environment jsdom

import { cleanup, renderHook, waitFor } from "@testing-library/react";
import { act } from "react";
import type { UseFormReturn } from "react-hook-form";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { TicketDraftFormPayload } from "../api/mapper";
import { useTicketDraft } from "./useTicketDraft";

const draftMocks = vi.hoisted(() => ({
  createDraft: vi.fn(),
  updateDraft: vi.fn(),
  discardDraft: vi.fn(),
  useDraftQuery: vi.fn(),
}));

vi.mock("../api/mutations", () => ({
  useCreateServiceDeskTicketDraft: () => ({
    mutateAsync: draftMocks.createDraft,
  }),
  useUpdateServiceDeskTicketDraft: () => ({
    mutateAsync: draftMocks.updateDraft,
  }),
  useDiscardServiceDeskTicketDraft: () => ({
    mutateAsync: draftMocks.discardDraft,
  }),
}));

vi.mock("../api/queries", () => ({
  useServiceDeskTicketDraftQuery: draftMocks.useDraftQuery,
}));

afterEach(cleanup);

beforeEach(() => {
  vi.clearAllMocks();
  draftMocks.useDraftQuery.mockReturnValue({ data: null });
  draftMocks.discardDraft.mockResolvedValue(undefined);
});

function createValues(
  overrides: Partial<TicketDraftFormPayload> = {},
): TicketDraftFormPayload {
  return {
    id: null,
    category: undefined,
    subject: "",
    body: "",
    dueAt: new Date("2026-09-01T00:00:00.000Z"),
    priority: "medium",
    riskLevel: "medium",
    email: { to: [], cc: [], bcc: [] },
    requester: { id: "requester", email: "", name: "Requester" },
    attachment: [],
    ...overrides,
  };
}

function createForm(values: TicketDraftFormPayload) {
  return {
    getValues: vi.fn(() => values),
  } as unknown as UseFormReturn<TicketDraftFormPayload>;
}

describe("useTicketDraft lifecycle", () => {
  it("does not create an empty draft", async () => {
    const { result } = renderHook(() =>
      useTicketDraft({ mode: "create", form: createForm(createValues()) }),
    );

    await expect(result.current.saveDraftNow()).resolves.toBeNull();
    expect(draftMocks.createDraft).not.toHaveBeenCalled();
  });

  it("creates then updates one draft while excluding browser File objects", async () => {
    const values = createValues({
      subject: "Printer issue",
      attachment: [new File(["raw"], "report.txt")],
    });
    const form = createForm(values);
    draftMocks.createDraft.mockResolvedValue({ ...values, id: "draft-1" });
    draftMocks.updateDraft.mockResolvedValue({ ...values, id: "draft-1" });
    const { result } = renderHook(() =>
      useTicketDraft({ mode: "create", form }),
    );

    await act(async () => {
      await result.current.saveDraftNow();
    });

    expect(draftMocks.createDraft).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: "Printer issue",
        attachment: [],
      }),
    );
    await waitFor(() => expect(result.current.draftId).toBe("draft-1"));

    await act(async () => {
      await result.current.saveDraftNow();
    });

    expect(draftMocks.updateDraft).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "draft-1",
        subject: "Printer issue",
        attachment: [],
      }),
    );
  });

  it("allows at most one draft save operation at a time", async () => {
    let resolveCreate: ((value: TicketDraftFormPayload) => void) | undefined;
    const pendingCreate = new Promise<TicketDraftFormPayload>((resolve) => {
      resolveCreate = resolve;
    });
    const values = createValues({ subject: "Printer issue" });
    draftMocks.createDraft.mockReturnValue(pendingCreate);
    const { result } = renderHook(() =>
      useTicketDraft({ mode: "create", form: createForm(values) }),
    );

    const firstSave = result.current.saveDraftNow();
    const secondSave = result.current.saveDraftNow();

    await expect(secondSave).resolves.toBeNull();
    expect(draftMocks.createDraft).toHaveBeenCalledOnce();

    resolveCreate?.({ ...values, id: "draft-1" });
    await act(async () => {
      await firstSave;
    });
  });

  it("discards the persisted draft and clears its local identity", async () => {
    const persistedDraft = createValues({ id: "draft-server", subject: "Saved" });
    draftMocks.useDraftQuery.mockReturnValue({ data: persistedDraft });
    const { result } = renderHook(() =>
      useTicketDraft({
        mode: "create",
        form: createForm(createValues()),
      }),
    );

    await waitFor(() => expect(result.current.draftId).toBe("draft-server"));
    await act(async () => {
      await result.current.removeDraft();
    });

    expect(draftMocks.discardDraft).toHaveBeenCalledWith("draft-server");
    expect(result.current.draftId).toBeNull();
  });
});
