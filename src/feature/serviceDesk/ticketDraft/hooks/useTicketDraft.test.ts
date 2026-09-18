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
  prepare: vi.fn(),
  cancelQueries: vi.fn(),
  setQueryData: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({ cancelQueries: draftMocks.cancelQueries, setQueryData: draftMocks.setQueryData }),
}));
vi.mock("../api/repo", () => ({
  useTicketDraftRepoContext: () => ({ userId: "requester", dataScope: "REMOTE" }),
}));
vi.mock("@/feature/serviceDesk/ticket/api/api", () => ({
  serviceDeskTicketApi: { prepareAttachments: draftMocks.prepare },
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
  draftMocks.prepare.mockImplementation(async ({ body }) => ({ body, files: [], images: [] }));
});

function createValues(
  overrides: Partial<TicketDraftFormPayload> = {},
): TicketDraftFormPayload {
  return {
    id: null,
    category: "10",
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
  it.each([undefined, "", "0"])("does not save dirty content without a valid category (%s)", async (category) => {
    const values = createValues({ category, subject: "Unsaved", body: "<p>Details</p>", attachment: [new File(["raw"], "report.txt")] });
    const { result } = renderHook(() => useTicketDraft({ mode: "create", form: createForm(values) }));
    await expect(result.current.saveDraftNow()).resolves.toBeNull();
    expect(draftMocks.prepare).not.toHaveBeenCalled();
    expect(draftMocks.createDraft).not.toHaveBeenCalled();
    expect(draftMocks.updateDraft).not.toHaveBeenCalled();
  });

  it("saves a category-only draft", async () => {
    const values = createValues();
    draftMocks.createDraft.mockResolvedValue({ ...values, id: "draft-1" });
    const { result } = renderHook(() => useTicketDraft({ mode: "create", form: createForm(values) }));
    await act(async () => { await result.current.saveDraftNow(); });
    expect(draftMocks.createDraft).toHaveBeenCalledWith(expect.objectContaining({ category: "10", subject: "", body: "" }));
  });

  it("does not create an empty draft", async () => {
    const { result } = renderHook(() =>
      useTicketDraft({ mode: "create", form: createForm(createValues({ category: undefined })) }),
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
    expect(draftMocks.setQueryData).toHaveBeenCalledWith(expect.arrayContaining(["REMOTE", "requester"]), null);
  });

  it("creates a new draft after discard instead of updating the removed row", async () => {
    const values = createValues({ id: "discarded", subject: "New draft" });
    draftMocks.useDraftQuery.mockReturnValue({ data: values });
    draftMocks.createDraft.mockImplementation(async (payload) => ({ ...payload, id: "replacement" }));
    const { result, rerender } = renderHook(() => useTicketDraft({ mode: "create", form: createForm(values) }));
    await act(async () => { await result.current.removeDraft(); });
    draftMocks.useDraftQuery.mockReturnValue({ data: null });
    rerender();
    await act(async () => { await result.current.saveDraftNow(); });
    expect(draftMocks.updateDraft).not.toHaveBeenCalled();
    expect(result.current.draftId).toBe("replacement");
  });

  it("keeps an update in flight exclusive and permits retry after failure", async () => {
    const values = createValues({ id: "draft-1", subject: "Saved draft" });
    draftMocks.useDraftQuery.mockReturnValue({ data: values });
    let rejectUpdate!: (reason: Error) => void;
    draftMocks.updateDraft.mockReturnValue(new Promise((_resolve, reject) => {
      rejectUpdate = reject;
    }));
    const { result } = renderHook(() => useTicketDraft({ mode: "create", form: createForm(values) }));
    await waitFor(() => expect(result.current.draftId).toBe("draft-1"));

    const firstSave = result.current.saveDraftNow();
    const firstResult = expect(firstSave).rejects.toThrow("Save failed");
    const secondSave = result.current.saveDraftNow();
    await waitFor(() => expect(draftMocks.updateDraft).toHaveBeenCalledOnce());
    // Settle both calls before asserting so the failing implementation cannot leave pending tests.
    rejectUpdate(new Error("Save failed"));
    const secondResult = await secondSave.catch(() => "overlapping update");
    await firstResult;
    expect(secondResult).toBeNull();
    expect(draftMocks.updateDraft).toHaveBeenCalledOnce();

    draftMocks.updateDraft.mockResolvedValue(values);
    await expect(result.current.saveDraftNow()).resolves.toEqual(values);
    expect(draftMocks.updateDraft).toHaveBeenCalledTimes(2);
  });

  it("starts a new draft after REMOTE submission clears the old draft and query", async () => {
    const values = createValues({ id: "submitted-draft", subject: "Next ticket" });
    draftMocks.useDraftQuery.mockReturnValue({ data: values });
    draftMocks.createDraft.mockImplementation(async (payload) => ({ ...payload, id: "new-draft" }));
    const { result, rerender } = renderHook(() => useTicketDraft({ mode: "create", form: createForm(values) }));
    await act(async () => { await result.current.clearDraft(); });
    expect(draftMocks.discardDraft).not.toHaveBeenCalled();
    expect(draftMocks.setQueryData).toHaveBeenCalledWith(expect.arrayContaining(["REMOTE", "requester"]), null);
    draftMocks.useDraftQuery.mockReturnValue({ data: null });
    rerender();
    await act(async () => { await result.current.saveDraftNow(); });
    expect(draftMocks.createDraft).toHaveBeenCalledWith(expect.objectContaining({ id: null }));
    expect(draftMocks.updateDraft).not.toHaveBeenCalled();
    expect(result.current.draftId).toBe("new-draft");
  });

  it("clears a stale identifier when the authoritative draft query becomes null", () => {
    draftMocks.useDraftQuery.mockReturnValue({ data: createValues({ id: "old-draft" }) });
    const { result, rerender } = renderHook(() => useTicketDraft({ mode: "create", form: createForm(createValues()) }));
    expect(result.current.draftId).toBe("old-draft");
    draftMocks.useDraftQuery.mockReturnValue({ data: undefined });
    rerender();
    expect(result.current.draftId).toBe("old-draft");
    draftMocks.useDraftQuery.mockReturnValue({ data: null });
    rerender();
    expect(result.current.draftId).toBeNull();
  });

  it("persists prepared inline images that survive reload and another save", async () => {
    draftMocks.prepare.mockResolvedValueOnce({ body: '<p>Image</p><img src="/files/demo-image.png">', files: [], images: [] });
    let stored: TicketDraftFormPayload | null = null;
    draftMocks.createDraft.mockImplementation(async (payload) => {
      stored = JSON.parse(JSON.stringify({ ...payload, id: "draft-image" }));
      return stored;
    });
    const first = renderHook(() => useTicketDraft({ mode: "create", form: createForm(createValues({
      body: '<p>Image</p><img src="data:image/png;base64,aGVsbG8=">',
    })) }));
    await act(async () => { await first.result.current.saveDraftNow(); });
    expect(draftMocks.prepare).toHaveBeenCalledWith({ body: '<p>Image</p><img src="data:image/png;base64,aGVsbG8=">', files: [] });
    expect(stored!.body).toContain('/files/demo-');
    expect(stored!.body).not.toMatch(/data:|blob:/);
    first.unmount();

    draftMocks.useDraftQuery.mockReturnValue({ data: stored });
    draftMocks.updateDraft.mockImplementation(async (payload) => payload);
    const reloaded = renderHook(() => useTicketDraft({ mode: "create", form: createForm(stored!) }));
    await act(async () => { await reloaded.result.current.saveDraftNow(); });
    expect(draftMocks.updateDraft).toHaveBeenCalledWith(expect.objectContaining({ body: stored!.body }));
  });

  it("does not persist content when attachment preparation fails and permits retry", async () => {
    draftMocks.prepare.mockRejectedValueOnce(new Error("Preparation failed"));
    draftMocks.createDraft.mockResolvedValue(createValues({ id: "new" }));
    const { result } = renderHook(() => useTicketDraft({ mode: "create", form: createForm(createValues({ subject: "Saved" })) }));
    await expect(result.current.saveDraftNow()).rejects.toThrow("Preparation failed");
    expect(draftMocks.createDraft).not.toHaveBeenCalled();
    await act(async () => { await result.current.saveDraftNow(); });
    expect(draftMocks.createDraft).toHaveBeenCalledOnce();
  });
});
