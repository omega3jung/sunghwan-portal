// app/api/employees/[userId]/route.ts
import { NextRequest, NextResponse } from "next/server";

import { checkAdmin, isRemoteRequest } from "@/app/api/_adapters";
import { portalApiJson } from "@/app/api/_adapters/backend";
import { IdRouteContext } from "@/app/api/_adapters/http";
import {
  getLocalEmployee,
  updateLocalEmployee,
} from "@/app/api/_adapters/localDemo/organization";
import {
  mapEmployeeItemPayload,
  toEmployeeWritePayload,
  type UpdateEmployeeInput,
} from "@/lib/application/contracts/organization";

export async function GET(request: NextRequest, context: IdRouteContext) {
  const authError = await getAdminError(request);
  if (authError) return authError;

  const { id } = await context.params;
  const isRemote = await isRemoteRequest(request);

  // demo mode
  if (!isRemote) {
    // Return mock department.

    const targetEmployee = getLocalEmployee(id);

    if (!targetEmployee) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    return NextResponse.json(targetEmployee);
  }

  return portalApiJson(request, {
    path: `/employee/${id}`,
    errorMessage: "Failed to fetch employee",
    mapData: mapEmployeeItemPayload,
  });
}

export async function PUT(request: NextRequest, context: IdRouteContext) {
  const authError = await getAdminError(request);
  if (authError) return authError;

  const { id } = await context.params;
  const isRemote = await isRemoteRequest(request);

  const body = (await request.json()) as UpdateEmployeeInput;

  // demo mode
  if (!isRemote) {
    return NextResponse.json(updateLocalEmployee(body, id), { status: 200 });
  }

  return portalApiJson(request, {
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

  const { id } = await context.params;
  const isRemote = await isRemoteRequest(request);

  // demo mode
  if (!isRemote) {
    return new NextResponse(null, { status: 204 }); // DELETE is 204.
  }

  return portalApiJson(request, {
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
