import { NextRequest, NextResponse } from "next/server";

import { dispatchPortalApi } from "@/server/portalApi";

import { requestExternalPortalApi } from "./externalPortalApi";
import type { BackendJsonOptions } from "./types";

/**
 * Presents one backend transport contract to Next.js route handlers.
 *
 * Deployments with `API_BASE_URL` proxy to the external portal API; otherwise
 * the same request is dispatched to the in-process server implementation. DTO
 * mapping is applied only to successful bodies, preserving backend status and
 * error payloads without exposing deployment topology to route modules.
 */
export async function portalApiJson(
  request: NextRequest,
  options: BackendJsonOptions,
) {
  if (hasExternalPortalApiBaseUrl()) {
    return requestExternalPortalApi(request, options);
  }

  const response = await dispatchPortalApi(request, options);

  if (!options.mapData || !response.ok || response.status === 204) {
    return response;
  }

  const payload = await readPayload(response);

  if (payload === null) {
    return new NextResponse(null, { status: response.status });
  }

  const mappedPayload = options.mapData(payload);

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

function hasExternalPortalApiBaseUrl() {
  return Boolean(process.env.API_BASE_URL?.trim());
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
