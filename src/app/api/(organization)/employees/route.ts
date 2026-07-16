// app/api/employees/route.ts
import { NextRequest, NextResponse } from "next/server";

import { isRemoteRequest } from "@/app/api/_adapters";
import { portalApiJson } from "@/app/api/_adapters/backend";
import {
  createLocalEmployee,
  listLocalEmployees,
} from "@/app/api/_adapters/localDemo/organization";
import {
  mapEmployeeItemPayload,
  mapEmployeeListPayload,
} from "@/lib/application/contracts/organization";
import {
  type CreateEmployeeInput,
  toEmployeeWritePayload,
} from "@/lib/application/contracts/organization";

export async function GET(request: NextRequest) {
  const isRemote = await isRemoteRequest(request);

  // demo mode
  if (!isRemote) {
    // Return mock categories of it service deck.

    return NextResponse.json(listLocalEmployees(request.nextUrl.searchParams));
  }

  // real backend
  return portalApiJson(request, {
    path: "/employees",
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
    return NextResponse.json(createLocalEmployee(body), { status: 201 });
  }

  return portalApiJson(request, {
    method: "POST",
    path: "/employees",
    body: toEmployeeWritePayload(body),
    errorMessage: "Failed to create employee",
    mapData: mapEmployeeItemPayload,
  });
}
