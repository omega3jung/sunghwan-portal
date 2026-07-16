import { NextRequest, NextResponse } from "next/server";

import { isRemoteRequest } from "@/app/api/_adapters";
import {
  createLocalCompany,
  listLocalCompanies,
} from "@/app/api/_adapters/localDemo/organization";
import {
  mapCompanyItemPayload,
  mapCompanyListPayload,
  type CreateCompanyInput,
  toCompanyWritePayload,
} from "@/lib/application/contracts/organization";

import { portalApiJson } from "@/app/api/_adapters/backend";

export async function GET(request: NextRequest) {
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

export async function POST(request: NextRequest) {
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
