// @vitest-environment jsdom

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ saveTree: vi.fn(), invalidate: vi.fn() }));
vi.mock("./api", () => ({ serviceDeskApprovalStepApi: { saveTree: mocks.saveTree } }));
vi.mock("./invalidation", () => ({ invalidateApprovalStepMutationQueries: mocks.invalidate }));
vi.mock("@/lib/client/i18n/runtime", () => ({ default: { t: () => "confirm" } }));

import { useSaveServiceDeskApprovalStepTree } from "./mutations";

afterEach(cleanup);
beforeEach(() => vi.clearAllMocks());

describe("Approval settings mutation workflow impact", () => {
  const payload = { tenantId: "7", categories: [] };

  it("retries with force and invalidates after confirmation", async () => {
    const conflict = createConflict();
    mocks.saveTree.mockRejectedValueOnce(conflict).mockResolvedValueOnce([]);
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const { queryClient, wrapper } = createContext();
    const { result } = renderHook(() => useSaveServiceDeskApprovalStepTree(), { wrapper });

    await result.current.mutateAsync(payload);

    expect(mocks.saveTree).toHaveBeenNthCalledWith(2, { ...payload, force: true });
    expect(mocks.invalidate).toHaveBeenCalledWith(queryClient);
  });

  it("does not retry or invalidate when confirmation is canceled", async () => {
    const conflict = createConflict();
    mocks.saveTree.mockRejectedValue(conflict);
    vi.spyOn(window, "confirm").mockReturnValue(false);
    const { wrapper } = createContext();
    const { result } = renderHook(() => useSaveServiceDeskApprovalStepTree(), { wrapper });

    await expect(result.current.mutateAsync(payload)).rejects.toBe(conflict);
    expect(mocks.saveTree).toHaveBeenCalledOnce();
    expect(mocks.invalidate).not.toHaveBeenCalled();
  });
});

function createConflict() {
  return Object.assign(new Error("conflict"), {
    isAxiosError: true,
    response: {
      status: 409,
      data: { message: "Approval configuration affects active tickets." },
    },
  });
}

function createContext() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { queryClient, wrapper };
}
