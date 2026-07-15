"use client";

import { useCallback, useEffect, useState } from "react";

import {
  readSessionStorage,
  removeSessionStorage,
  writeSessionStorage,
} from "./sessionStorage";

type Options<T> = {
  key: string;
  initialValue: T;
  version?: number;
  migrate?: (raw: unknown) => T;
};

type SetState<T> = React.Dispatch<React.SetStateAction<T>>;

/**
 * Persists React state in `sessionStorage` and keeps the stored value synchronized with local state.
 *
 * Use for:
 * - Storing client-only UI state that should survive page navigation within the session
 * - Hydrating local component state from `sessionStorage` with optional version migration
 *
 * @param options - Configuration for the storage key, initial value, version, and optional migration logic
 * @returns An object containing the hydrated flag, current value, and helpers to update, reset, or remove the stored state
 */
export function useSessionStorageState<T>({
  key,
  initialValue,
  version,
  migrate,
}: Options<T>) {
  /*
   * ---------------------------------------------------------
   * State
   * ---------------------------------------------------------
   */
  const [state, setState] = useState<T>(initialValue);
  const [hydrated, setHydrated] = useState(false);

  /*
   * ---------------------------------------------------------
   * Hydrate (on mount)
   * ---------------------------------------------------------
   */
  useEffect(() => {
    const stored = readSessionStorage<T>(key, {
      fallback: initialValue,
      version,
      migrate,
    });

    setState(stored);
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  /*
   * ---------------------------------------------------------
   * Persist (on change)
   * ---------------------------------------------------------
   */
  useEffect(() => {
    if (!hydrated) return;

    writeSessionStorage(key, state, version);
  }, [hydrated, key, state, version]);

  /*
   * ---------------------------------------------------------
   * Actions
   * ---------------------------------------------------------
   */
  const set: SetState<T> = useCallback((value) => {
    setState((prev) =>
      typeof value === "function" ? (value as (prev: T) => T)(prev) : value,
    );
  }, []);

  const reset = useCallback(() => {
    setState(initialValue);
    writeSessionStorage(key, initialValue, version);
  }, [initialValue, key, version]);

  const remove = useCallback(() => {
    removeSessionStorage(key);
    setState(initialValue);
  }, [initialValue, key]);

  /*
   * ---------------------------------------------------------
   * Return
   * ---------------------------------------------------------
   */
  return {
    hydrated,
    value: state,
    setValue: set,
    reset,
    remove,
  };
}
