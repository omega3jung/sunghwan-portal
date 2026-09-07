import { NextRequest, NextResponse } from "next/server";

import {
  getAdminErrorResponse,
  isRemoteRequest,
} from "@/app/api/_adapters";
import { portalApiJson } from "@/app/api/_adapters/backend";
import { IdRouteContext } from "@/app/api/_adapters/http";
import {
  getLocalCompany,
  updateLocalCompany,
} from "@/app/api/_adapters/localDemo/organization";
import {
  mapCompanyItemPayload,
  toCompanyWritePayload,
  type UpdateCompanyInput,
} from "@/lib/application/contracts/organization";

/** Handles GET /api/companies/[id]; authorization and runtime adapter selection remain at this HTTP boundary. */
export async function GET(request: NextRequest, context: IdRouteContext) {
  const authError = await getAdminErrorResponse(request);
  if (authError) return authError;

  const { id } = await context.params;
  const isRemote = await isRemoteRequest(request);

  // demo mode
  if (!isRemote) {
    const targetCompany = getLocalCompany(id);

    if (!targetCompany) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    return NextResponse.json(targetCompany);
  }

  return portalApiJson(request, {
    path: `/company/${id}`,
    errorMessage: "Failed to fetch company",
    mapData: mapCompanyItemPayload,
  });
}

/** Handles PUT /api/companies/[id]; authorization and runtime adapter selection remain at this HTTP boundary. */
export async function PUT(request: NextRequest, context: IdRouteContext) {
  const authError = await getAdminErrorResponse(request);
  if (authError) return authError;

  const { id } = await context.params;
  const isRemote = await isRemoteRequest(request);

  const body = (await request.json()) as UpdateCompanyInput;

  // demo mode
  if (!isRemote) {
    return NextResponse.json(updateLocalCompany(body, id), { status: 200 });
  }

  return portalApiJson(request, {
    method: "PUT",
    path: `/company/${id}`,
    body: toCompanyWritePayload({ ...body, id }),
    errorMessage: "Failed to update company",
    mapData: mapCompanyItemPayload,
  });
}

/** Handles DELETE /api/companies/[id]; authorization and runtime adapter selection remain at this HTTP boundary. */
export async function DELETE(request: NextRequest, context: IdRouteContext) {
  const authError = await getAdminErrorResponse(request);
  if (authError) return authError;

  const { id } = await context.params;
  const isRemote = await isRemoteRequest(request);

  // demo mode
  if (!isRemote) {
    return new NextResponse(null, { status: 204 });
  }

  return portalApiJson(request, {
    method: "DELETE",
    path: `/company/${id}`,
    errorMessage: "Failed to delete company",
  });
}
