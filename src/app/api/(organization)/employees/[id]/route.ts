// app/api/employees/[userId]/route.ts
import { NextRequest, NextResponse } from "next/server";

import { checkAdmin, isRemoteRequest, proxyJson } from "@/app/api/_helpers";
import { IdRouteContext } from "@/app/api/_helpers/types";
import {
  camelEmployeeMapper,
  mapEmployeeItemPayload,
} from "@/feature/organization/employee/mapper";
import {
  toEmployeeMockResource,
  toEmployeeWritePayload,
  UpdateEmployeeInput,
} from "@/feature/organization/employee/write";
import { createEmployeesMock } from "@/mocks/domain/organization/employee";

export async function GET(request: NextRequest, context: IdRouteContext) {
  const authError = await getAdminError(request);
  if (authError) return authError;

  const { id } = context.params;
  const isRemote = await isRemoteRequest(request);

  // demo mode
  if (!isRemote) {
    // Return mock department.

    const employeeData = camelEmployeeMapper(createEmployeesMock());
    const targetEmployee = employeeData.find(
      (employee) => employee.id === Number(id),
    );

    if (!targetEmployee) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    return NextResponse.json(targetEmployee);
  }

  return proxyJson(request, {
    path: `/employee/${id}`,
    errorMessage: "Failed to fetch employee",
    mapData: mapEmployeeItemPayload,
  });
}

export async function PUT(request: NextRequest, context: IdRouteContext) {
  const authError = await getAdminError(request);
  if (authError) return authError;

  const { id } = context.params;
  const isRemote = await isRemoteRequest(request);

  const body = (await request.json()) as UpdateEmployeeInput;

  // demo mode
  if (!isRemote) {
    return NextResponse.json(toEmployeeMockResource(body, id), { status: 200 });
  }

  return proxyJson(request, {
    method: "PUT",
    path: `/employee/${id}`,
    body: toEmployeeWritePayload({ ...body, id }),
    errorMessage: "Failed to update employee",
    mapData: mapEmployeeItemPayload,
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

  return proxyJson(request, {
    method: "DELETE",
    path: `/employee/${id}`,
    errorMessage: "Failed to delete employee",
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
