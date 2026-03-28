// app/api/departments/route.ts
import { NextRequest, NextResponse } from "next/server";

import {
  camelDepartmentMapper,
  mapDepartmentItemPayload,
  mapDepartmentListPayload,
} from "@/api/organization/department/mapper";
import {
  CreateDepartmentInput,
  toDepartmentMockResource,
  toDepartmentWritePayload,
} from "@/api/organization/department/write";
import { departmentsMock } from "@/app/_mocks/domain/organization";
import { isRemoteRequest, proxyJson } from "@/app/api/_helpers";

export async function GET(request: NextRequest) {
  const isRemote = await isRemoteRequest(request);

  // demo mode
  if (!isRemote) {
    // Return mock categories of it service deck.

    const departmentData = camelDepartmentMapper(departmentsMock);

    return NextResponse.json({
      items: departmentData,
      total: departmentData.length,
    });
  }

  // real backend
  return proxyJson(request, {
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

  return proxyJson(request, {
    method: "POST",
    path: "/department",
    body: toDepartmentWritePayload(body),
    errorMessage: "Failed to create department",
    mapData: mapDepartmentItemPayload,
  });
}
