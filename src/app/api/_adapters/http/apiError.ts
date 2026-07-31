import { NextResponse } from "next/server";

import { ApiError, resolveApiErrorMessage } from "@/lib/application/api";

type ErrorResponseOptions = {
  fallbackMessage: string;
  fallbackStatus?: number;
};

/** Converts unknown route failures to the project's stable JSON error response without exposing internals. */
export const toApiErrorResponse = (
  error: unknown,
  { fallbackMessage, fallbackStatus = 500 }: ErrorResponseOptions,
) => {
  const status =
    error &&
    typeof error === "object" &&
    "status" in error &&
    typeof error.status === "number"
      ? error.status
      : fallbackStatus;
  const message =
    error instanceof ApiError
      ? resolveApiErrorMessage(error.messageKey, error.options)
      : typeof error === "string" && error.trim()
        ? error
        : error &&
            typeof error === "object" &&
            "message" in error &&
            typeof error.message === "string"
          ? error.message
          : fallbackMessage;

  return NextResponse.json({ message }, { status });
};
