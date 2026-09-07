// @vitest-environment jsdom

import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ticketSearchCriteriaFormDefaultValues } from "@/feature/serviceDesk/ticketSearch";

import { useInsightsSearchState } from "./useInsightsSearchState";

const mocks = vi.hoisted(() => ({
  storage: {
    hydrated: true,
    value: undefined as unknown,
    setValue: vi.fn(),
  },
}));

vi.mock("@/shared/client/useSessionStorageState", () => ({
  useSessionStorageState: () => mocks.storage,
}));

const storedState = {
  ...ticketSearchCriteriaFormDefaultValues,
  keyword: "restored",
  scope: "PORTAL" as const,
};

afterEach(cleanup);

describe("useInsightsSearchState", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.storage.hydrated = true;
    mocks.storage.value = storedState;
  });

  it("restores persisted criteria and scope after hydration", async () => {
    const { result } = renderHook(() => useInsightsSearchState());

    await waitFor(() => expect(result.current.scope).toBe("PORTAL"));
    expect(result.current.criteria.keyword).toBe("restored");
    expect(result.current.pickerRange).toEqual(storedState.period.dateRange);
  });

  it("keeps an incomplete picker range out of applied search criteria", async () => {
    const { result } = renderHook(() => useInsightsSearchState());
    await waitFor(() => expect(result.current.scope).toBe("PORTAL"));
    const previousCriteriaRange = result.current.criteria.period.dateRange;
    const from = new Date("2026-09-01T00:00:00Z");

    act(() => result.current.handleRangeChange({ from }));

    expect(result.current.pickerRange).toEqual({ from });
    expect(result.current.criteria.period.dateRange).toEqual(previousCriteriaRange);
    expect(mocks.storage.setValue).not.toHaveBeenCalled();
  });

  it("applies a complete range with the most recently selected preset", async () => {
    const { result } = renderHook(() => useInsightsSearchState());
    await waitFor(() => expect(result.current.scope).toBe("PORTAL"));
    const range = {
      from: new Date("2026-08-01T00:00:00Z"),
      to: new Date("2026-08-31T00:00:00Z"),
    };

    act(() => result.current.handlePeriodChange("range"));
    act(() => result.current.handleRangeChange(range));

    expect(result.current.criteria.period).toEqual({
      type: "range",
      dateRange: range,
    });
    expect(mocks.storage.setValue).toHaveBeenLastCalledWith(expect.any(Function));
    const updater = mocks.storage.setValue.mock.calls.at(-1)?.[0];
    expect(updater(storedState)).toMatchObject({
      scope: "PORTAL",
      period: { type: "range", dateRange: range },
    });
  });

  it("persists a scope change without replacing the current criteria", async () => {
    const { result } = renderHook(() => useInsightsSearchState());
    await waitFor(() => expect(result.current.scope).toBe("PORTAL"));

    act(() => result.current.handleScopeChange("INTERNAL"));

    expect(result.current.scope).toBe("INTERNAL");
    const updater = mocks.storage.setValue.mock.calls.at(-1)?.[0];
    expect(updater(storedState)).toMatchObject({
      keyword: "restored",
      scope: "INTERNAL",
    });
  });
});
