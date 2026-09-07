// @vitest-environment jsdom

import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  ticketSearchCriteriaFormDefaultValues,
  type TicketSearchCriteriaFormValues,
} from "@/feature/serviceDesk/ticketSearch";

import { TICKET_PAGE_SIZE, useServiceDeskSearchState } from "./useServiceDeskSearchState";

const mocks = vi.hoisted(() => ({
  form: { reset: vi.fn() },
  queryResult: {
    data: undefined as unknown,
    isLoading: false,
    refetch: vi.fn(),
  },
  storage: {
    hydrated: true,
    value: undefined as unknown,
    setValue: vi.fn(),
  },
  useTicketSearchQuery: vi.fn(),
}));

vi.mock("@/feature/serviceDesk/ticket/client", () => ({
  useServiceDeskTicketSearchQuery: mocks.useTicketSearchQuery,
}));

vi.mock("@/feature/serviceDesk/ticketSearch/client", () => ({
  useTicketSearchCriteriaForm: () => mocks.form,
}));

vi.mock("@/shared/client/useSessionStorageState", () => ({
  useSessionStorageState: () => mocks.storage,
}));

const storedSearch = {
  ...ticketSearchCriteriaFormDefaultValues,
  keyword: "restored search",
  page: 3,
  order: "asc" as const,
  scope: "PORTAL" as const,
  sort: "priority" as const,
};

afterEach(cleanup);

describe("useServiceDeskSearchState", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.storage.hydrated = true;
    mocks.storage.value = storedSearch;
    mocks.queryResult.data = undefined;
    mocks.useTicketSearchQuery.mockImplementation(() => mocks.queryResult);
  });

  it("restores persisted criteria, pagination, sort, and scope before querying", async () => {
    const { result } = renderHook(() => useServiceDeskSearchState());

    await waitFor(() => expect(result.current.page).toBe(3));

    expect(mocks.form.reset).toHaveBeenCalledWith(
      expect.objectContaining({ keyword: "restored search" }),
    );
    expect(mocks.useTicketSearchQuery).toHaveBeenLastCalledWith(
      expect.objectContaining({
        criteria: expect.objectContaining({
          keyword: "restored search",
          cat_scope: "PORTAL",
        }),
        sort: "priority",
        order: "asc",
        page: 3,
        pageSize: TICKET_PAGE_SIZE,
        enabled: true,
      }),
    );
  });

  it("resets pagination when criteria, sort, order, or scope changes", async () => {
    const { result } = renderHook(() => useServiceDeskSearchState());
    await waitFor(() => expect(result.current.page).toBe(3));

    const nextCriteria: TicketSearchCriteriaFormValues = {
      ...ticketSearchCriteriaFormDefaultValues,
      keyword: "new search",
    };
    await act(async () => result.current.submitSearch(nextCriteria));
    expect(result.current.page).toBe(1);
    expect(mocks.storage.setValue).toHaveBeenLastCalledWith(
      expect.objectContaining({ keyword: "new search", page: 1 }),
    );

    act(() => result.current.changePage(4));
    act(() => result.current.changeSort("createdAt"));
    expect(result.current).toMatchObject({ page: 1, sort: "createdAt" });

    act(() => result.current.changePage(4));
    act(() => result.current.toggleOrder());
    expect(result.current).toMatchObject({ page: 1, order: "desc" });

    act(() => result.current.changePage(4));
    act(() => result.current.changeScope("INTERNAL"));
    expect(result.current).toMatchObject({ page: 1, scope: "INTERNAL" });
  });

  it("clamps a restored page when the result count shrinks", async () => {
    mocks.storage.value = { ...storedSearch, page: 4 };
    mocks.queryResult.data = {
      items: [],
      totalCount: 11,
      page: 4,
    };
    const { result } = renderHook(() => useServiceDeskSearchState());

    await waitFor(() => expect(result.current.page).toBe(2));

    const pageUpdater = mocks.storage.setValue.mock.calls
      .map(([value]) => value)
      .find((value) =>
        typeof value === "function" && value(storedSearch).page === 2,
      );
    expect(pageUpdater).toBeTypeOf("function");
  });

  it("keeps the ticket query disabled until session search state is hydrated", () => {
    mocks.storage.hydrated = false;
    mocks.storage.value = storedSearch;

    renderHook(() => useServiceDeskSearchState());

    expect(mocks.useTicketSearchQuery).toHaveBeenLastCalledWith(
      expect.objectContaining({ enabled: false }),
    );
    expect(mocks.form.reset).not.toHaveBeenCalled();
  });
});
