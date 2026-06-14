// app/api/departments/[userId]/route.ts
import { NextRequest, NextResponse } from "next/server";

import { checkAdmin, isRemoteRequest } from "@/app/api/_helpers";
import { portalApiJson } from "@/app/api/_helpers/portalApiJson";
import { IdRouteContext } from "@/app/api/_helpers/types";
import {
  camelDepartmentMapper,
  mapDepartmentItemPayload,
} from "@/feature/organization/department/mapper";
import {
  toDepartmentMockResource,
  toDepartmentWritePayload,
  UpdateDepartmentInput,
} from "@/feature/organization/department/write";
import { departmentsMock } from "@/mocks/domain/organization/departments";

export async function GET(request: NextRequest, context: IdRouteContext) {
  const authError = await getAdminError(request);
  if (authError) return authError;

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

  return portalApiJson(request, {
    path: `/department/${id}`,
    errorMessage: "Failed to fetch department",
    mapData: mapDepartmentItemPayload,
  });
}

export async function PUT(request: NextRequest, context: IdRouteContext) {
  const authError = await getAdminError(request);
  if (authError) return authError;

  const { id } = context.params;
  const isRemote = await isRemoteRequest(request);

  const body = (await request.json()) as UpdateDepartmentInput;

  // demo mode
  if (!isRemote) {
    return NextResponse.json(toDepartmentMockResource(body, id), {
      status: 200,
    });
  }

  return portalApiJson(request, {
    method: "PUT",
    path: `/department/${id}`,
    body: toDepartmentWritePayload({ ...body, id }),
    errorMessage: "Failed to update department",
    mapData: mapDepartmentItemPayload,
  });
}

export async function DELETE(request: NextRequest, context: IdRouteContext) {
  const authError = await getAdminError(request);
  if (authError) return authError;

  const { id } = context.params;
  const isRemote = await isRemoteRequest(request);

  // demo mode
  if (!isRemote) {
    return new NextResponse(null, { status: 204 }); // DELETE is 204.
  }

  return portalApiJson(request, {
    method: "DELETE",
    path: `/department/${id}`,
    errorMessage: "Failed to delete department",
  });
}

async function getAdminError(req: NextRequest) {
  const auth = await checkAdmin(req);

  if (auth.ok) {
    return null;
  }

  return NextResponse.json(
    { message: auth.status === 401 ? "Unauthorized" : "Forbidden" },
    { status: auth.status },
  );
}
