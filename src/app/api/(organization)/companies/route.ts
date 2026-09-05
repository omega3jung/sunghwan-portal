import { NextRequest, NextResponse } from "next/server";

import {
  getAdminErrorResponse,
  isRemoteRequest,
} from "@/app/api/_adapters";
import { portalApiJson } from "@/app/api/_adapters/backend";
import {
  createLocalCompany,
  listLocalCompanies,
} from "@/app/api/_adapters/localDemo/organization";
import {
  type CreateCompanyInput,
  mapCompanyItemPayload,
  mapCompanyListPayload,
  toCompanyWritePayload,
} from "@/lib/application/contracts/organization";

/** Handles GET /api/companies; authorization and runtime adapter selection remain at this HTTP boundary. */
export async function GET(request: NextRequest) {
  const authError = await getAdminErrorResponse(request);
  if (authError) return authError;

  const isRemote = await isRemoteRequest(request);

  // demo mode
  if (!isRemote) {
    return NextResponse.json(listLocalCompanies());
  }

  // real backend
  return portalApiJson(request, {
    path: "/company",
    query: request.nextUrl.searchParams,
    errorMessage: "Failed to fetch companies",
    mapData: mapCompanyListPayload,
  });
}

/** Handles POST /api/companies; authorization and runtime adapter selection remain at this HTTP boundary. */
export async function POST(request: NextRequest) {
  const authError = await getAdminErrorResponse(request);
  if (authError) return authError;

  const isRemote = await isRemoteRequest(request);

  const body = (await request.json()) as CreateCompanyInput;

  // demo mode
  if (!isRemote) {
    return NextResponse.json(createLocalCompany(body), { status: 201 });
  }

  return portalApiJson(request, {
    method: "POST",
    path: "/company",
    body: toCompanyWritePayload(body),
    errorMessage: "Failed to create company",
    mapData: mapCompanyItemPayload,
  });
}
