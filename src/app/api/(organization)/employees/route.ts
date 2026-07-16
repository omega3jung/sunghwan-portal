// app/api/employees/route.ts
import { NextRequest, NextResponse } from "next/server";

import { resolveApiErrorMessage } from "@/app/api/_adapters/serviceDesk";
import { isRemoteRequest } from "@/app/api/_helpers";
import {
  camelEmployeeMapper,
  mapEmployeeItemPayload,
  mapEmployeeListPayload,
} from "@/feature/organization/employee/mapper";
import {
  CreateEmployeeInput,
  toEmployeeMockResource,
  toEmployeeWritePayload,
} from "@/feature/organization/employee/write";
import {
  applyRuleGroupFilter,
  parseRuleGroupFilter,
} from "@/lib/application/api/query";
import { employeesMock } from "@/mocks/domain/organization/employee";
import {
  handleServiceDeskEligibleEmployeesPortalApi,
  isServiceDeskEligibleEmployeeRequest,
} from "@/server/portalApi/employees/employeesPortalApiHandler";

import { portalApiJson } from "../../_helpers/portalApiJson";

export async function GET(request: NextRequest) {
  if (isServiceDeskEligibleEmployeeRequest(request)) {
    return handleServiceDeskEligibleEmployeesPortalApi(request, {
      query: request.nextUrl.searchParams,
      errorMessage: resolveApiErrorMessage("serviceDesk.eligibleActors.fetch"),
    });
  }

  const isRemote = await isRemoteRequest(request);

  // demo mode
  if (!isRemote) {
    // Return mock categories of it service deck.

    const employeeData = camelEmployeeMapper(
      applyRuleGroupFilter(
        employeesMock,
        parseRuleGroupFilter(request.nextUrl.searchParams.get("filter")),
      ),
    );

    return NextResponse.json({ data: employeeData });
  }

  // real backend
  return portalApiJson(request, {
    path: "/employees",
    query: request.nextUrl.searchParams,
    errorMessage: "Failed to fetch employees",
    mapData: mapEmployeeListPayload,
  });
}

export async function POST(request: NextRequest) {
  const isRemote = await isRemoteRequest(request);

  const body = (await request.json()) as CreateEmployeeInput;

  // demo mode
  if (!isRemote) {
    return NextResponse.json(toEmployeeMockResource(body), { status: 201 });
  }

  return portalApiJson(request, {
    method: "POST",
    path: "/employees",
    body: toEmployeeWritePayload(body),
    errorMessage: "Failed to create employee",
    mapData: mapEmployeeItemPayload,
  });
}
