// @vitest-environment jsdom

import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useServiceDeskSettingsEditorState } from "./useServiceDeskSettingsEditorState";

const mocks = vi.hoisted(() => ({
  confirmDiscard: vi.fn(),
}));

vi.mock("./useConfirmDiscardChanges", () => ({
  useConfirmDiscardChanges: () => mocks.confirmDiscard,
}));

function createPageContext() {
  return {
    access: "manage" as const,
    availableScopes: ["INTERNAL", "PORTAL"] as ("INTERNAL" | "PORTAL")[],
    canManage: true,
    canRead: true,
    contextKey: "tenant-1:INTERNAL",
    isOwnerTenant: false,
    isTenantSelectionLoading: false,
    language: "en" as const,
    ownerCompanyId: "1",
    selectedScope: "INTERNAL" as const,
    selectedTenant: "tenant-1",
    selectedTenantData: null,
    selectScope: vi.fn(),
    setLanguage: vi.fn(),
  };
}

afterEach(cleanup);

describe("useServiceDeskSettingsEditorState", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.confirmDiscard.mockReturnValue(true);
  });

  it("enables save and reset only for a valid, manageable dirty draft", () => {
    const pageContext = createPageContext();
    const reset = vi.fn();

    const { result } = renderHook(() =>
      useServiceDeskSettingsEditorState({
        pageContext,
        draft: { isReady: true, isDirty: true, reset },
        isSaving: false,
        isValid: true,
        queries: [{ error: null, isLoading: false, isReady: true }],
      }),
    );

    expect(result.current).toMatchObject({
      hasError: false,
      isLoading: false,
      canReset: true,
      canSave: true,
    });
    act(() => result.current.onReset());
    expect(reset).toHaveBeenCalledOnce();
  });

  it("blocks a scope change when discarding dirty edits is rejected", () => {
    mocks.confirmDiscard.mockReturnValue(false);
    const pageContext = createPageContext();
    const { result } = renderHook(() =>
      useServiceDeskSettingsEditorState({
        pageContext,
        draft: { isReady: true, isDirty: true, reset: vi.fn() },
        isSaving: false,
        queries: [],
      }),
    );

    act(() => result.current.toolbar.scope.onValueChange("PORTAL"));

    expect(mocks.confirmDiscard).toHaveBeenCalledOnce();
    expect(pageContext.selectScope).not.toHaveBeenCalled();
    expect(result.current.toolbar.onBeforeTenantChange()).toBe(false);
  });

  it("reports query errors without leaving the editor in a loading state", () => {
    const pageContext = createPageContext();
    const { result } = renderHook(() =>
      useServiceDeskSettingsEditorState({
        pageContext,
        draft: { isReady: false, isDirty: false, reset: vi.fn() },
        isSaving: false,
        queries: [{ error: new Error("load failed"), isLoading: true, isReady: false }],
      }),
    );

    expect(result.current.hasError).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.canSave).toBe(false);
  });
});
