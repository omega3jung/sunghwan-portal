// app/api/employees/route.ts
import { NextRequest, NextResponse } from "next/server";

import {
  camelEmployeeMapper,
  mapEmployeeItemPayload,
  mapEmployeeListPayload,
} from "@/api/organization/employee/mapper";
import {
  CreateEmployeeInput,
  toEmployeeMockResource,
  toEmployeeWritePayload,
} from "@/api/organization/employee/write";
import { createEmployeesMock } from "@/app/_mocks/domain/organization/employee";
import { isRemoteRequest, proxyJson } from "@/app/api/_helpers";

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
