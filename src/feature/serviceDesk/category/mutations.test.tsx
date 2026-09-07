// @vitest-environment jsdom

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, renderHook } from "@testing-library/react";
import axios from "axios";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const saveTree = vi.hoisted(() => vi.fn());
vi.mock("./api", () => ({ serviceDeskCategoryApi: { saveTree } }));
vi.mock("@/lib/client/i18n/runtime", () => ({ default: { t: () => "confirm" } }));

import { useSaveServiceDeskCategoryTree } from "./mutations";
import { categoryQueryKeys } from "./queryKeys";

afterEach(cleanup);
beforeEach(() => vi.clearAllMocks());

describe("Category settings mutation workflow impact", () => {
  const payload = { tenantId: "7", categories: [] };

  it("retries with force only after explicit confirmation", async () => {
    const conflict = createConflict("Category changes affect active tickets.");
    saveTree.mockRejectedValueOnce(conflict).mockResolvedValueOnce([]);
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const { queryClient, wrapper } = createContext();
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useSaveServiceDeskCategoryTree(), { wrapper });

    await result.current.mutateAsync(payload);

    expect(saveTree).toHaveBeenNthCalledWith(1, payload);
    expect(saveTree).toHaveBeenNthCalledWith(2, { ...payload, force: true });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: categoryQueryKeys.all });
  });

  it("keeps the conflict and skips invalidation when confirmation is canceled", async () => {
    const conflict = createConflict("Category changes affect active tickets.");
    saveTree.mockRejectedValue(conflict);
    vi.spyOn(window, "confirm").mockReturnValue(false);
    const { queryClient, wrapper } = createContext();
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useSaveServiceDeskCategoryTree(), { wrapper });

    await expect(result.current.mutateAsync(payload)).rejects.toBe(conflict);
    expect(saveTree).toHaveBeenCalledOnce();
    expect(invalidate).not.toHaveBeenCalled();
  });
});

function createConflict(message: string) {
  const error = new Error(message);
  Object.assign(error, { isAxiosError: true, response: { status: 409, data: { message } } });
  expect(axios.isAxiosError(error)).toBe(true);
  return error;
}

function createContext() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { queryClient, wrapper };
}
