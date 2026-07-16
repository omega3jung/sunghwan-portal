// app/api/job-fields/route.ts
import { NextRequest, NextResponse } from "next/server";

import { resolveApiErrorMessage } from "@/app/api/_adapters/serviceDesk";
import { isRemoteRequest } from "@/app/api/_helpers";
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
import {
  applyRuleGroupFilter,
  parseRuleGroupFilter,
} from "@/lib/application/api/query";
import { allJobFieldsMock } from "@/mocks/domain/organization/jobFields";
import {
  handleServiceDeskJobFieldReferenceRequest,
  isServiceDeskOrganizationReferenceRequest,
} from "@/server/portalApi/organization/serviceDeskOrganizationReferenceHandler";

import { portalApiJson } from "../../_helpers/portalApiJson";

export async function GET(request: NextRequest) {
  if (isServiceDeskOrganizationReferenceRequest(request)) {
    return handleServiceDeskJobFieldReferenceRequest(request, {
      query: request.nextUrl.searchParams,
      errorMessage: resolveApiErrorMessage("serviceDesk.eligibleActors.fetch"),
    });
  }

  const isRemote = await isRemoteRequest(request);

  // demo mode
  if (!isRemote) {
    // Return mock categories of it service deck.

    const jobFieldData = camelJobFieldMapper(
      applyRuleGroupFilter(
        allJobFieldsMock,
        parseRuleGroupFilter(request.nextUrl.searchParams.get("filter")),
      ),
    );

    return NextResponse.json({
      items: jobFieldData,
      total: jobFieldData.length,
    });
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
    return NextResponse.json(toJobFieldMockResource(body), { status: 201 });
  }

  return portalApiJson(request, {
    method: "POST",
    path: "/job-field",
    body: toJobFieldWritePayload(body),
    errorMessage: "Failed to create job field",
    mapData: mapJobFieldItemPayload,
  });
}
