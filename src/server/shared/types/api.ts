// src/shared/types/api.ts

export type PaginatedSearchResponse<T> = {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
};

export type ApiSuccessResponse<T> = {
  success: true;
  data: T;
  error: null;
};

export type ApiErrorResponse = {
  success: false;
  data: null;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export function createSuccessResponse<T>(data: T): ApiSuccessResponse<T> {
  return {
    success: true,
    data,
    error: null,
  };
}

export function createErrorResponse({
  message,
  code = "INTERNAL_SERVER_ERROR",
  details,
}: {
  message: string;
  code?: string;
  details?: unknown;
}): ApiErrorResponse {
  return {
    success: false,
    data: null,
    error: {
      code,
      message,
      ...(details === undefined ? {} : { details }),
    },
  };
}
