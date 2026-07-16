// app/api/job-fields/route.ts
import { NextRequest, NextResponse } from "next/server";

import { resolveApiErrorMessage } from "@/app/api/_adapters/serviceDesk";
import {
  handleEmbeddedServiceDeskJobFieldReferenceRequest,
  isEmbeddedServiceDeskOrganizationReferenceRequest,
} from "@/app/api/_adapters/backend/embeddedServer";
import {
  createLocalJobField,
  listLocalJobFields,
} from "@/app/api/_adapters/localDemo/organization";
import { isRemoteRequest } from "@/app/api/_adapters";
import {
  mapJobFieldItemPayload,
  mapJobFieldListPayload,
} from "@/lib/application/contracts/organization";
import {
  type CreateJobFieldInput,
  toJobFieldWritePayload,
} from "@/lib/application/contracts/organization";

import { portalApiJson } from "@/app/api/_adapters/backend";

export async function GET(request: NextRequest) {
  if (isEmbeddedServiceDeskOrganizationReferenceRequest(request)) {
    return handleEmbeddedServiceDeskJobFieldReferenceRequest(request, {
      query: request.nextUrl.searchParams,
      errorMessage: resolveApiErrorMessage("serviceDesk.eligibleActors.fetch"),
    });
  }

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

export async function POST(request: NextRequest) {
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
