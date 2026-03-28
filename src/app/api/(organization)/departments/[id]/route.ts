// app/api/departments/[userId]/route.ts
import { NextRequest, NextResponse } from "next/server";

import {
  camelDepartmentMapper,
  mapDepartmentItemPayload,
} from "@/api/organization/department/mapper";
import {
  toDepartmentMockResource,
  toDepartmentWritePayload,
  UpdateDepartmentInput,
} from "@/api/organization/department/write";
import { departmentsMock } from "@/app/_mocks/domain/organization";
import { isRemoteRequest, proxyJson } from "@/app/api/_helpers";
import { IdRouteContext } from "@/app/api/_helpers/types";

export async function GET(request: NextRequest, context: IdRouteContext) {
  const { id } = context.params;
  const isRemote = await isRemoteRequest(request);

  // demo mode
  if (!isRemote) {
    // Return mock department.

    const departmentData = camelDepartmentMapper(departmentsMock);
    const targetDepartment = departmentData.find(
      (department) => department.id === id,
    );

    if (!targetDepartment) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    return NextResponse.json(targetDepartment);
  }

  return proxyJson(request, {
    path: `/department/${id}`,
    errorMessage: "Failed to fetch department",
    mapData: mapDepartmentItemPayload,
  });
}

export async function PUT(request: NextRequest, context: IdRouteContext) {
  const { id } = context.params;
  const isRemote = await isRemoteRequest(request);

  const body = (await request.json()) as UpdateDepartmentInput;

  // demo mode
  if (!isRemote) {
    return NextResponse.json(toDepartmentMockResource(body, id), {
      status: 200,
    });
  }

  return proxyJson(request, {
    method: "PUT",
    path: `/department/${id}`,
    body: toDepartmentWritePayload({ ...body, id }),
    errorMessage: "Failed to update department",
    mapData: mapDepartmentItemPayload,
  });
}

export async function DELETE(request: NextRequest, context: IdRouteContext) {
  const { id } = context.params;
  const isRemote = await isRemoteRequest(request);

  // demo mode
  if (!isRemote) {
    return new NextResponse(null, { status: 204 }); // DELETE is 204.
  }

  return proxyJson(request, {
    method: "DELETE",
    path: `/department/${id}`,
    errorMessage: "Failed to delete department",
  });
}
