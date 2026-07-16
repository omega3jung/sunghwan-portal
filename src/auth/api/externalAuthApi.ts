import { NextResponse } from "next/server";

import type { AuthApiJsonOptions } from "./types";

export async function requestExternalAuthApi({
  path,
  errorMessage,
  method = "POST",
  query,
  body,
  headers,
  mapData,
}: AuthApiJsonOptions) {
  try {
    const baseUrl = process.env.AUTH_API_BASE_URL?.replace(/\/$/, "");
    if (!baseUrl) throw new Error("AUTH_API_BASE_URL is not configured.");

    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    const url = new URL(`${baseUrl}${normalizedPath}`);

    if (query instanceof URLSearchParams) {
      url.search = query.toString();
    } else if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value === null || value === undefined) continue;
        if (Array.isArray(value)) {
          value.forEach((item) => url.searchParams.append(key, String(item)));
        } else {
          url.searchParams.append(key, String(value));
        }
      }
    }

    const requestHeaders = new Headers(headers);
    if (body !== undefined && !requestHeaders.has("Content-Type")) {
      requestHeaders.set("Content-Type", "application/json");
    }

    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      cache: "no-store",
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
    const raw = await response.text();
    const payload = parsePayload(raw);

    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    if (!response.ok) {
      return NextResponse.json(
        payload && typeof payload === "object"
          ? payload
          : { message: raw || errorMessage },
        { status: response.status },
      );
    }

    return NextResponse.json(mapData ? mapData(payload) : payload, {
      status: response.status,
    });
  } catch {
    return NextResponse.json({ message: errorMessage }, { status: 502 });
  }
}

function parsePayload(raw: string): unknown {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return raw;
  }
}
