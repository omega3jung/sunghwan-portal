"use client";

import { useCallback, useEffect, useState } from "react";

import {
  readSessionStorage,
  removeSessionStorage,
  writeSessionStorage,
} from "@/lib/sessionStorage";

/*
 * =========================================================
 * useSessionStorageState
 * ---------------------------------------------------------
 * Role:
 * - React-friendly wrapper for sessionStorage
 * - Handles hydrate / sync automatically
 * - Provides state + persistence abstraction
 *
 * Responsibility:
 * ❌ Does NOT know domain meaning
 * ❌ Does NOT manage server state
 * ✅ Only handles client persistence
 * =========================================================
 */

type Options<T> = {
  key: string;
  initialValue: T;
  version?: number;
  migrate?: (raw: unknown) => T;
};

type SetState<T> = React.Dispatch<React.SetStateAction<T>>;

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  /*
   * ---------------------------------------------------------
   * Persist (on change)
   * ---------------------------------------------------------
   */
  useEffect(() => {
    writeSessionStorage(key, state, version);
  }, [key, state, version]);

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
    value: state,
    setValue: set,
    reset,
    remove,
  };
}
