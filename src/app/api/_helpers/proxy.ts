import { NextRequest, NextResponse } from "next/server";

import { getAccessToken } from "./auth";

/**
 * Thin BFF JSON proxy helper for App Router route handlers.
 *
 * Route handlers use this to keep remote proxy logic consistent without
 * growing backend-specific boilerplate in each `route.ts`.
 *
 * Responsibility boundary:
 * - build the backend URL and query string
 * - inject the authenticated access token when required
 * - reject invalid GET/HEAD bodies early
 * - normalize JSON / 204 responses into NextResponse
 * - provide a stable fallback for config or network-level failures
 *
 * This is intentionally JSON-oriented. It is not a generic raw proxy for
 * arbitrary streaming, multipart, or passthrough response handling.
 */
type ProxyMethod = "GET" | "HEAD" | "POST" | "PUT" | "PATCH" | "DELETE";
type QueryPrimitive = string | number | boolean;
type QueryValue =
  | QueryPrimitive
  | readonly QueryPrimitive[]
  | QueryPrimitive[]
  | null
  | undefined;
type ProxyQuery = URLSearchParams | Record<string, QueryValue>;

type ProxyJsonOptions = {
  path: string;
  errorMessage: string;
  method?: ProxyMethod;
  query?: ProxyQuery;
  body?: unknown;
  headers?: HeadersInit;
  requireAuth?: boolean;
  mapData?: (payload: unknown) => unknown;
};

/**
 * Main entry point used by App Router BFF routes when the remote backend
 * contract is JSON or `204 No Content`.
 */
export async function proxyJson(
  request: NextRequest,
  {
    path,
    errorMessage,
    method = "GET",
    query,
    body,
    headers,
    requireAuth = true,
    mapData,
  }: ProxyJsonOptions,
) {
  try {
    if ((method === "GET" || method === "HEAD") && body !== undefined) {
      throw new TypeError(`${method} requests cannot include a body.`);
    }

    const url = buildBackendUrl(path, query);
    const requestHeaders = new Headers(headers);

    if (requireAuth) {
      const accessToken = await getAccessToken(request);

      if (!accessToken) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      }

      requestHeaders.set("Authorization", `Bearer ${accessToken}`);
    }

    if (body !== undefined && !requestHeaders.has("Content-Type")) {
      requestHeaders.set("Content-Type", "application/json");
    }

    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      cache: "no-store",
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });

    return toNextResponse(response, errorMessage, mapData);
  } catch (error) {
    const isConfigError =
      error instanceof Error &&
      error.message === "API_BASE_URL is not configured.";
    const isRequestShapeError =
      error instanceof TypeError &&
      error.message.includes("requests cannot include a body");

    return NextResponse.json(
      { message: isConfigError || isRequestShapeError ? error.message : errorMessage },
      { status: isConfigError ? 500 : isRequestShapeError ? 500 : 502 },
    );
  }
}

/**
 * Converts route-level path/query input into a backend URL.
 * This helper stays focused on URL shaping so route handlers do not duplicate
 * query serialization rules such as array support.
 */
function buildBackendUrl(path: string, query?: ProxyQuery) {
  const baseUrl = process.env.API_BASE_URL?.replace(/\/$/, "");

  if (!baseUrl) {
    throw new Error("API_BASE_URL is not configured.");
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${baseUrl}${normalizedPath}`);

  if (!query) {
    return url;
  }

  const searchParams =
    query instanceof URLSearchParams
      ? new URLSearchParams(query)
      : new URLSearchParams();

  if (!(query instanceof URLSearchParams)) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null) continue;

      if (Array.isArray(value)) {
        for (const item of value) {
          searchParams.append(key, String(item));
        }
        continue;
      }

      searchParams.append(key, String(value));
    }
  }

  url.search = searchParams.toString();
  return url;
}

/**
 * Converts a backend response into the normalized Next.js response used by the
 * BFF layer, including `204` handling and optional read-model mapping.
 */
async function toNextResponse(
  response: Response,
  fallbackMessage: string,
  mapData?: (payload: unknown) => unknown,
) {
  if (response.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  const payload = await readPayload(response);

  if (!response.ok) {
    return NextResponse.json(
      normalizeErrorPayload(payload, fallbackMessage),
      { status: response.status },
    );
  }

  if (payload === null) {
    return new NextResponse(null, { status: response.status });
  }

  const mappedPayload = mapData ? mapData(payload) : payload;

  if (typeof mappedPayload === "string") {
    return new NextResponse(mappedPayload, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("Content-Type") ?? "text/plain",
      },
    });
  }

  return NextResponse.json(mappedPayload, { status: response.status });
}

/**
 * Reads a backend response as text first, then upgrades to JSON when possible.
 * This keeps the proxy JSON-first while still tolerating plain-text fallbacks.
 */
async function readPayload(response: Response) {
  const raw = await response.text();

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return raw;
  }
}

/**
 * Normalizes backend error payloads into the route-layer error shape used by
 * this BFF: `{ message, code?, details? }`.
 */
function normalizeErrorPayload(payload: unknown, fallbackMessage: string) {
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;

    if (typeof record.message === "string") {
      return {
        message: record.message,
        ...(typeof record.code === "string" ? { code: record.code } : {}),
        ...("details" in record ? { details: record.details } : {}),
      };
    }

    if (typeof record.error === "string") {
      return {
        message: record.error,
        ...(typeof record.code === "string" ? { code: record.code } : {}),
        ...("details" in record ? { details: record.details } : {}),
      };
    }

    if (typeof record.cmt === "string") {
      return {
        message: record.cmt,
        ...(typeof record.result === "string" ? { code: record.result } : {}),
        ...("details" in record ? { details: record.details } : {}),
      };
    }
  }

  if (typeof payload === "string" && payload.trim()) {
    return { message: payload };
  }

  return { message: fallbackMessage };
}
