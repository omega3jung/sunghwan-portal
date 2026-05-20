import { NextRequest } from "next/server";

import { AccessLevel, Role } from "@/domain/auth";

import type { PortalApiJsonOptions, PortalApiQueryValue } from "./types";

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
export function resolveRole(value: unknown): Role | null {
  if (
    value === "ADMIN" ||
    value === "MANAGER" ||
    value === "LEADER" ||
    value === "USER" ||
    value === "GUEST"
  ) {
    return value;
  }

  return null;
}

export function resolveAccessLevel(value: unknown): AccessLevel | null {
  if (value === 9 || value === 7 || value === 5 || value === 3 || value === 1) {
    return value;
  }

  return null;
}

export function parsePreferenceKey(preferenceKey: string) {
  const lastDotIndex = preferenceKey.lastIndexOf(".");

  if (lastDotIndex === -1) {
    throw new Error(`Invalid preference key: ${preferenceKey}`);
  }

  return {
    moduleKey: preferenceKey.slice(0, lastDotIndex),
    preferenceType: preferenceKey.slice(lastDotIndex + 1),
  };
}
