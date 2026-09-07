// @vitest-environment jsdom

import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { writeSessionStorage } from "./sessionStorage";
import { useSessionStorageState } from "./useSessionStorageState";

describe("useSessionStorageState", () => {
  beforeEach(() => window.sessionStorage.clear());
  afterEach(cleanup);

  it("hydrates a persisted value and persists functional updates", async () => {
    writeSessionStorage("counter", 2, 1);
    const { result } = renderHook(() =>
      useSessionStorageState({ key: "counter", initialValue: 0, version: 1 }),
    );

    await waitFor(() => expect(result.current.hydrated).toBe(true));
    expect(result.current.value).toBe(2);

    act(() => result.current.setValue((previous) => previous + 1));
    await waitFor(() => {
      expect(JSON.parse(window.sessionStorage.getItem("counter") ?? "null")).toEqual({
        value: 3,
        version: 1,
      });
    });
  });

  it("uses a migration during hydration", async () => {
    writeSessionStorage("filters", { query: "vpn" }, 1);
    const { result } = renderHook(() =>
      useSessionStorageState({
        key: "filters",
        initialValue: { keyword: "" },
        version: 2,
        migrate: (raw) => ({ keyword: (raw as { query: string }).query }),
      }),
    );

    await waitFor(() => expect(result.current.value).toEqual({ keyword: "vpn" }));
  });

  it("resets and removes persisted state", async () => {
    const { result } = renderHook(() =>
      useSessionStorageState({ key: "counter", initialValue: 0 }),
    );
    await waitFor(() => expect(result.current.hydrated).toBe(true));

    act(() => result.current.setValue(5));
    act(() => result.current.reset());
    expect(result.current.value).toBe(0);
    expect(JSON.parse(window.sessionStorage.getItem("counter") ?? "null")).toEqual({
      value: 0,
    });

    act(() => result.current.setValue(7));
    act(() => result.current.remove());
    expect(result.current.value).toBe(0);
    expect(window.sessionStorage.getItem("counter")).toBeNull();
  });

  it("rehydrates safely when the storage key changes", async () => {
    writeSessionStorage("first", "one");
    writeSessionStorage("second", "two");
    const { result, rerender } = renderHook(
      ({ storageKey }) =>
        useSessionStorageState({ key: storageKey, initialValue: "fallback" }),
      { initialProps: { storageKey: "first" } },
    );

    await waitFor(() => expect(result.current.value).toBe("one"));
    rerender({ storageKey: "second" });
    await waitFor(() => expect(result.current.value).toBe("two"));
  });
});
