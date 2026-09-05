// app/api/job-fields/route.ts
import { NextRequest, NextResponse } from "next/server";

import {
  getAdminErrorResponse,
  isRemoteRequest,
} from "@/app/api/_adapters";
import { portalApiJson } from "@/app/api/_adapters/backend";
import {
  createLocalJobField,
  listLocalJobFields,
} from "@/app/api/_adapters/localDemo/organization";
import {
  mapJobFieldItemPayload,
  mapJobFieldListPayload,
} from "@/lib/application/contracts/organization";
import {
  type CreateJobFieldInput,
  toJobFieldWritePayload,
} from "@/lib/application/contracts/organization";

/** Handles GET /api/job-fields; authorization and runtime adapter selection remain at this HTTP boundary. */
export async function GET(request: NextRequest) {
  const authError = await getAdminErrorResponse(request);
  if (authError) return authError;

  const isRemote = await isRemoteRequest(request);

  // demo mode
  if (!isRemote) {
    // Return mock categories of it service deck.

    return NextResponse.json(listLocalJobFields(request.nextUrl.searchParams));
  }

  // real backend
  return portalApiJson(request, {
    path: "/job-field",
    query: request.nextUrl.searchParams,
    errorMessage: "Failed to fetch job fields",
    mapData: mapJobFieldListPayload,
  });
}

/** Handles POST /api/job-fields; authorization and runtime adapter selection remain at this HTTP boundary. */
export async function POST(request: NextRequest) {
  const authError = await getAdminErrorResponse(request);
  if (authError) return authError;

  const isRemote = await isRemoteRequest(request);

  const body = (await request.json()) as CreateJobFieldInput;

  // demo mode
  if (!isRemote) {
    return NextResponse.json(createLocalJobField(body), { status: 201 });
  }

  return portalApiJson(request, {
    method: "POST",
    path: "/job-field",
    body: toJobFieldWritePayload(body),
    errorMessage: "Failed to create job field",
    mapData: mapJobFieldItemPayload,
  });
}
