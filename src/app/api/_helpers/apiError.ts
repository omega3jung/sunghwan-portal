import { NextResponse } from "next/server";

type ErrorResponseOptions = {
  fallbackMessage: string;
  fallbackStatus?: number;
};

const resolveErrorStatus = (
  error: unknown,
  fallbackStatus: number,
): number => {
  if (
    error &&
    typeof error === "object" &&
    "status" in error &&
    typeof error.status === "number"
  ) {
    return error.status;
  }

  return fallbackStatus;
};

const resolveErrorMessage = (
  error: unknown,
  fallbackMessage: string,
): string => {
  if (typeof error === "string" && error.trim()) {
    return error;
  }

  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return fallbackMessage;
};

export const toApiErrorResponse = (
  error: unknown,
  { fallbackMessage, fallbackStatus = 500 }: ErrorResponseOptions,
) => {
  return NextResponse.json(
    {
      message: resolveErrorMessage(error, fallbackMessage),
    },
    {
      status: resolveErrorStatus(error, fallbackStatus),
    },
  );
};
