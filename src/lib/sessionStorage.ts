/*
 * =========================================================
 * Session Storage Utility
 * ---------------------------------------------------------
 * Role:
 * - Safe wrapper around browser sessionStorage
 * - SSR-safe (Next.js App Router compatible)
 * - JSON serialization / deserialization
 * - Fault-tolerant (parse errors fallback)
 * - Optional versioning support
 * =========================================================
 */

type ReadOptions<T> = {
  fallback: T;
  version?: number;
  migrate?: (raw: unknown) => T;
};

type StoredValue<T> = {
  version?: number;
  value: T;
};

/*
 * ---------------------------------------------------------
 * Internal: environment check
 * ---------------------------------------------------------
 */
function isBrowser(): boolean {
  return typeof window !== "undefined";
}

/*
 * ---------------------------------------------------------
 * Read from sessionStorage
 * ---------------------------------------------------------
 */
export function readSessionStorage<T>(key: string, options: ReadOptions<T>): T {
  const { fallback, version, migrate } = options;

  if (!isBrowser()) return fallback;

  try {
    const raw = window.sessionStorage.getItem(key);
    if (!raw) return fallback;

    const parsed = JSON.parse(raw) as StoredValue<T> | T;

    // case 1: stored without wrapper (legacy)
    if (!("value" in (parsed as any))) {
      return (parsed as T) ?? fallback;
    }

    const stored = parsed as StoredValue<T>;

    // version mismatch → migrate or fallback
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

/*
 * ---------------------------------------------------------
 * Write to sessionStorage
 * ---------------------------------------------------------
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

/*
 * ---------------------------------------------------------
 * Remove single key
 * ---------------------------------------------------------
 */
export function removeSessionStorage(key: string): void {
  if (!isBrowser()) return;

  try {
    window.sessionStorage.removeItem(key);
  } catch {
    // ignore
  }
}

/*
 * ---------------------------------------------------------
 * Clear all sessionStorage (⚠️ use carefully)
 * ---------------------------------------------------------
 */
export function clearSessionStorage(): void {
  if (!isBrowser()) return;

  try {
    window.sessionStorage.clear();
  } catch {
    // ignore
  }
}
