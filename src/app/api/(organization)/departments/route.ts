// app/api/departments/route.ts
import { NextRequest, NextResponse } from "next/server";

import { isRemoteRequest } from "@/app/api/_adapters";
import { portalApiJson } from "@/app/api/_adapters/backend";
import {
  createLocalDepartment,
  listLocalDepartments,
} from "@/app/api/_adapters/localDemo/organization";
import {
  mapDepartmentItemPayload,
  mapDepartmentListPayload,
} from "@/lib/application/contracts/organization";
import {
  type CreateDepartmentInput,
  toDepartmentWritePayload,
} from "@/lib/application/contracts/organization";

export async function GET(request: NextRequest) {
  const isRemote = await isRemoteRequest(request);

  // demo mode
  if (!isRemote) {
    // Return mock categories of it service deck.

    return NextResponse.json(
      listLocalDepartments(request.nextUrl.searchParams),
    );
  }

  // real backend
  return portalApiJson(request, {
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
    return NextResponse.json(createLocalDepartment(body), { status: 201 });
  }

  return portalApiJson(request, {
    method: "POST",
    path: "/department",
    body: toDepartmentWritePayload(body),
    errorMessage: "Failed to create department",
    mapData: mapDepartmentItemPayload,
  });
}
