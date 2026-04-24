// app/api/employees/route.ts
import { NextRequest, NextResponse } from "next/server";

import { isRemoteRequest, proxyJson } from "@/app/api/_helpers";
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
import { createEmployeesMock } from "@/mocks/domain/organization/employee";

export async function GET(request: NextRequest) {
  const isRemote = await isRemoteRequest(request);

  // demo mode
  if (!isRemote) {
    // Return mock categories of it service deck.

    const employeeData = camelEmployeeMapper(createEmployeesMock());

    return NextResponse.json({
      items: employeeData,
      total: employeeData.length,
    });
  }

  // real backend
  return proxyJson(request, {
    path: "/employee",
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

  return proxyJson(request, {
    method: "POST",
    path: "/employee",
    body: toEmployeeWritePayload(body),
    errorMessage: "Failed to create employee",
    mapData: mapEmployeeItemPayload,
  });
}
