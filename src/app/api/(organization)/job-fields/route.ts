// app/api/job-fields/route.ts
import { NextRequest, NextResponse } from "next/server";

import { isRemoteRequest, proxyJson } from "@/app/api/_helpers";
import {
  camelJobFieldMapper,
  mapJobFieldItemPayload,
  mapJobFieldListPayload,
} from "@/feature/organization/jobField/mapper";
import {
  CreateJobFieldInput,
  toJobFieldMockResource,
  toJobFieldWritePayload,
} from "@/feature/organization/jobField/write";
import { jobFieldsMock } from "@/mocks/domain/organization/jobFields";

export async function GET(request: NextRequest) {
  const isRemote = await isRemoteRequest(request);

  // demo mode
  if (!isRemote) {
    // Return mock categories of it service deck.

    const jobFieldData = camelJobFieldMapper(jobFieldsMock);

    return NextResponse.json({
      items: jobFieldData,
      total: jobFieldData.length,
    });
  }

  // real backend
  return proxyJson(request, {
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
    return NextResponse.json(toJobFieldMockResource(body), { status: 201 });
  }

  return proxyJson(request, {
    method: "POST",
    path: "/job-field",
    body: toJobFieldWritePayload(body),
    errorMessage: "Failed to create job field",
    mapData: mapJobFieldItemPayload,
  });
}
