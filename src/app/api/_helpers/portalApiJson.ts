import { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { proxyJson } from "@/app/api/_helpers";
import { dispatchPortalApi } from "@/server/portalApi";
import { PortalApiJsonOptions } from "@/server/portalApi/types";

export async function portalApiJson(
  request: NextRequest,
  options: PortalApiJsonOptions,
) {
  if (hasExternalPortalApiBaseUrl()) {
    return proxyJson(request, options);
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
  const baseUrl = process.env.API_BASE_URL;
  return typeof baseUrl === "string" && baseUrl.trim().length > 0;
}

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
