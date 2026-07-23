import { NextRequest, NextResponse } from "next/server";

import { getAccessToken } from "@/app/api/_adapters/auth/requestAuth";

import type { BackendJsonOptions, BackendQuery } from "./types";

export async function requestExternalPortalApi(
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
  }: BackendJsonOptions,
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
      {
        message:
          isConfigError || isRequestShapeError ? error.message : errorMessage,
      },
      { status: isConfigError || isRequestShapeError ? 500 : 502 },
    );
  }
}

function buildBackendUrl(path: string, query?: BackendQuery) {
  const baseUrl = process.env.API_BASE_URL?.replace(/\/$/, "");

  if (!baseUrl) {
    throw new Error("API_BASE_URL is not configured.");
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${baseUrl}${normalizedPath}`);

  if (!query) return url;

  const searchParams =
    query instanceof URLSearchParams
      ? new URLSearchParams(query)
      : new URLSearchParams();

  if (!(query instanceof URLSearchParams)) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null) continue;

      if (Array.isArray(value)) {
        value.forEach((item) => searchParams.append(key, String(item)));
      } else {
        searchParams.append(key, String(value));
      }
    }
  }

  url.search = searchParams.toString();
  return url;
}

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
    return NextResponse.json(normalizeErrorPayload(payload, fallbackMessage), {
      status: response.status,
    });
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

async function readPayload(response: Response) {
  const raw = await response.text();

  if (!raw) return null;

  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return raw;
  }
}

function normalizeErrorPayload(payload: unknown, fallbackMessage: string) {
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    const message =
      typeof record.message === "string"
        ? record.message
        : typeof record.error === "string"
          ? record.error
          : typeof record.cmt === "string"
            ? record.cmt
            : null;

    if (message) {
      return {
        message,
        ...(typeof record.code === "string" ? { code: record.code } : {}),
        ...(typeof record.result === "string" && !("code" in record)
          ? { code: record.result }
          : {}),
        ...("details" in record ? { details: record.details } : {}),
      };
    }
  }

  if (typeof payload === "string" && payload.trim()) {
    return { message: payload };
  }

  return { message: fallbackMessage };
}
