// app/api/departments/route.ts
import { NextRequest, NextResponse } from "next/server";

import { resolveApiErrorMessage } from "@/app/api/_adapters/serviceDesk";
import { isRemoteRequest } from "@/app/api/_helpers";
import {
  camelDepartmentMapper,
  mapDepartmentItemPayload,
  mapDepartmentListPayload,
} from "@/feature/organization/department/mapper";
import {
  CreateDepartmentInput,
  toDepartmentMockResource,
  toDepartmentWritePayload,
} from "@/feature/organization/department/write";
import {
  applyRuleGroupFilter,
  parseRuleGroupFilter,
} from "@/lib/application/api/query";
import { allDepartmentsMock } from "@/mocks/domain/organization/departments";
import {
  handleServiceDeskDepartmentReferenceRequest,
  isServiceDeskOrganizationReferenceRequest,
} from "@/server/portalApi/organization/serviceDeskOrganizationReferenceHandler";

import { portalApiJson } from "../../_helpers/portalApiJson";

export async function GET(request: NextRequest) {
  if (isServiceDeskOrganizationReferenceRequest(request)) {
    return handleServiceDeskDepartmentReferenceRequest(request, {
      query: request.nextUrl.searchParams,
      errorMessage: resolveApiErrorMessage("serviceDesk.eligibleActors.fetch"),
    });
  }

  const isRemote = await isRemoteRequest(request);

  // demo mode
  if (!isRemote) {
    // Return mock categories of it service deck.

    const departmentData = camelDepartmentMapper(
      applyRuleGroupFilter(
        allDepartmentsMock,
        parseRuleGroupFilter(request.nextUrl.searchParams.get("filter")),
      ),
    );

    return NextResponse.json({
      items: departmentData,
      total: departmentData.length,
    });
  }

  // real backend
  return portalApiJson(request, {
    path: "/department",
    query: request.nextUrl.searchParams,
    errorMessage: "Failed to fetch departments",
    mapData: mapDepartmentListPayload,
  });
}

export async function POST(request: NextRequest) {
  const isRemote = await isRemoteRequest(request);

  const body = (await request.json()) as CreateDepartmentInput;

  // demo mode
  if (!isRemote) {
    return NextResponse.json(toDepartmentMockResource(body), { status: 201 });
  }

  return portalApiJson(request, {
    method: "POST",
    path: "/department",
    body: toDepartmentWritePayload(body),
    errorMessage: "Failed to create department",
    mapData: mapDepartmentItemPayload,
  });
}
