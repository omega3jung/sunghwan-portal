import { NextRequest } from "next/server";

import { AccessLevel } from "@/domain/auth";

import type { PortalApiJsonOptions, PortalApiQueryValue } from "./types";

/** Normalizes path so downstream server logic receives a stable representation. */
export function normalizePath(path: string): string {
  return path.startsWith("/") ? path : `/${path}`;
}

function resolvePortalApiQueryValue(value: PortalApiQueryValue): string | null {
  if (value === null || value === undefined) return null;

  if (Array.isArray(value)) {
    const firstValue = value.find(
      (item): item is string | number | boolean =>
        item !== null && item !== undefined,
    );

    return firstValue === undefined ? null : String(firstValue);
  }

  return String(value);
}

/** Returns the first scalar value for a normalized portal query parameter. */
export function getPortalApiQueryValue(
  request: NextRequest,
  options: Pick<PortalApiJsonOptions, "query">,
  key: string,
): string | null {
  const { query } = options;

  if (query instanceof URLSearchParams) {
    return query.get(key) ?? request.nextUrl.searchParams.get(key);
  }

  const optionValue = query?.[key];

  return (
    resolvePortalApiQueryValue(optionValue) ??
    request.nextUrl.searchParams.get(key)
  );
}
/** Resolves access level from the current server-side context and policy. */
export function resolveAccessLevel(value: unknown): AccessLevel | null {
  if (value === 9 || value === 7 || value === 5 || value === 3 || value === 1) {
    return value;
  }

  return null;
}

/** Parses preference key from the untrusted request representation. */
export function parsePreferenceKey(preferenceKey: string) {
  const lastDotIndex = preferenceKey.lastIndexOf(".");

  if (lastDotIndex === -1) {
    throw new Error(`Invalid preference key: ${preferenceKey}`);
  }

  return preferenceKey.slice(0, lastDotIndex);
}
