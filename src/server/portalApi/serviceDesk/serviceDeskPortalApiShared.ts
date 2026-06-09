import { NextRequest, NextResponse } from "next/server";

import { getAuthToken } from "@/app/api/_helpers";
import { getActiveTenants } from "@/server/data/serviceDesk/tenant";
import { isBoolean } from "@/shared/utils/value";

import { PortalApiJsonOptions } from "../types";
import { getPortalApiQueryValue } from "../utils";

export type ServiceDeskPortalApiContext = {
  request: NextRequest;
  options: PortalApiJsonOptions;
  path: string;
  method: string;
};

export function createNotFoundResponse() {
  return NextResponse.json({ message: "Not found" }, { status: 404 });
}

export function parseBooleanQueryValue(value: string | null): boolean | null {
  if (value === null || !isBoolean(value)) {
    return null;
  }

  return value === "true";
}

export function parseNumberValue(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsedValue = Number(value);

    if (Number.isFinite(parsedValue)) {
      return parsedValue;
    }
  }

  return null;
}

export function parseOptionalNumber(value: unknown) {
  return parseNumberValue(value);
}

export function parseOptionalId(value: unknown) {
  return parseNumberValue(value);
}

export function requireBody<T>(options: PortalApiJsonOptions): T {
  if (!isRecord(options.body)) {
    throw createStatusError("Invalid request body.", 400);
  }

  return options.body as T;
}

export async function resolveAccessibleTenantIds(
  context: ServiceDeskPortalApiContext,
): Promise<number[]> {
  const explicitTenantId = parseNumberValue(
    getPortalApiQueryValue(context.request, context.options, "tenantId"),
  );

  if (explicitTenantId !== null) {
    return [explicitTenantId];
  }

  const activeTenants = await getActiveTenants();
  const token = await getAuthToken(context.request);
  const isInternal =
    parseBooleanQueryValue(
      getPortalApiQueryValue(context.request, context.options, "isInternal"),
    ) ?? token?.userScope === "INTERNAL";

  if (isInternal) {
    return activeTenants.map((tenant) => tenant.tenant_id);
  }

  const defaultTenantId = resolveDefaultTenantId(token);

  if (defaultTenantId !== null) {
    return [defaultTenantId];
  }

  return activeTenants.slice(0, 1).map((tenant) => tenant.tenant_id);
}

export function resolveDefaultTenantId(
  token: Awaited<ReturnType<typeof getAuthToken>>,
) {
  if (typeof token?.companyId === "number") {
    return Number(token.companyId);
  }

  return null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function createStatusError(message: string, status: number) {
  const error = new Error(message) as Error & { status: number };
  error.status = status;
  return error;
}
