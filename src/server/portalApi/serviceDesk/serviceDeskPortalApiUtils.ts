import { type NextRequest, NextResponse } from "next/server";

import { isBoolean } from "@/shared/utils/value";

import type { PortalApiJsonOptions } from "../types";

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

function parseNumberValue(value: unknown): number | null {
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

export function parseOptionalId(value: unknown) {
  return parseNumberValue(value);
}

export function requireBody<T>(options: PortalApiJsonOptions): T {
  if (!isRecord(options.body)) {
    throw createStatusError("Invalid request body.", 400);
  }

  return options.body as T;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function createStatusError(message: string, status: number) {
  const error = new Error(message) as Error & { status: number };
  error.status = status;
  return error;
}
