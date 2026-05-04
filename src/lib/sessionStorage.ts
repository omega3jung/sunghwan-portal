type ReadOptions<T> = {
  fallback: T;
  version?: number;
  migrate?: (raw: unknown) => T;
};

type StoredValue<T> = {
  version?: number;
  value: T;
};

/**
 * Checks whether the current runtime has access to the browser `window` object.
 *
 * Use for:
 * - Guarding browser-only storage access in shared modules
 * - Keeping session storage helpers safe during server-side rendering
 *
 * @param none - This function does not accept any arguments
 * @returns `true` when the code is running in a browser environment, otherwise `false`
 */
function isBrowser(): boolean {
  return typeof window !== "undefined";
}

/**
 * Reads and deserializes a value from `sessionStorage` with optional version migration support.
 *
 * Use for:
 * - Restoring persisted client state with a safe fallback value
 * - Migrating stored values when the persisted shape changes between versions
 *
 * @param key - The `sessionStorage` key to read from
 * @param options - The fallback value and optional versioning or migration settings for the stored entry
 * @returns The restored value, a migrated value, or the provided fallback when reading fails
 */
export function readSessionStorage<T>(key: string, options: ReadOptions<T>): T {
  const { fallback, version, migrate } = options;

  if (!isBrowser()) return fallback;

  try {
    const raw = window.sessionStorage.getItem(key);
    if (!raw) return fallback;

    const parsed = JSON.parse(raw) as StoredValue<T> | T;

    if (!("value" in (parsed as any))) {
      return (parsed as T) ?? fallback;
    }

    const stored = parsed as StoredValue<T>;

    if (version !== undefined && stored.version !== version) {
      if (migrate) {
        return migrate(stored.value);
      }
      return fallback;
    }

    return stored.value ?? fallback;
  } catch {
    return fallback;
  }
}

/**
 * Serializes and writes a value to `sessionStorage`, optionally attaching a version wrapper.
 *
 * Use for:
 * - Persisting client-only state between page navigations in the same session
 * - Storing versioned values that may need migration on future reads
 *
 * @param key - The `sessionStorage` key to write to
 * @param value - The value to serialize and store
 * @param version - The optional version number to persist alongside the stored value
 * @returns Nothing; the function writes the serialized value when browser storage is available
 */
export function writeSessionStorage<T>(
  key: string,
  value: T,
  version?: number,
): void {
  if (!isBrowser()) return;

  try {
    const payload: StoredValue<T> = {
      value,
      ...(version !== undefined ? { version } : {}),
    };

    window.sessionStorage.setItem(key, JSON.stringify(payload));
  } catch {
    // silently ignore (quota exceeded, etc.)
  }
}

/**
 * Removes a single key from `sessionStorage`.
 *
 * Use for:
 * - Clearing one persisted UI state entry without affecting other stored values
 * - Resetting a specific session-scoped cache item
 *
 * @param key - The `sessionStorage` key to remove
 * @returns Nothing; the function removes the key when browser storage is available
 */
export function removeSessionStorage(key: string): void {
  if (!isBrowser()) return;

  try {
    window.sessionStorage.removeItem(key);
  } catch {
    // ignore
  }
}

/**
 * Clears every key from `sessionStorage` for the current browser origin.
 *
 * Use for:
 * - Resetting all session-scoped client state during logout or recovery flows
 * - Removing all persisted temporary values in a browser session
 *
 * @param none - This function does not accept any arguments
 * @returns Nothing; the function clears all session storage when browser storage is available
 */
export function clearSessionStorage(): void {
  if (!isBrowser()) return;

  try {
    window.sessionStorage.clear();
  } catch {
    // ignore
  }
}
