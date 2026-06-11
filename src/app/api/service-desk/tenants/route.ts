import { NextRequest, NextResponse } from "next/server";

import {
  getAuthToken,
  isRemoteRequest,
  toApiErrorResponse,
} from "@/app/api/_helpers";
import { tServiceDeskApi } from "@/app/api/service-desk/_shared/messages";
import {
  createTenantSchema,
  mapTenantItemPayload,
  mapTenantListPayload,
  toTenantWritePayload,
} from "@/feature/serviceDesk/tenant";
import { localCreateTenant, localListTenants } from "@/server/serviceDesk/settings/tenant/localDemo";

import { portalApiJson } from "../../_helpers/portalApiJson";

export async function GET(request: NextRequest) {
  const token = await getAuthToken(request);
  const isRemote = token?.dataScope === "REMOTE";

  if (!isRemote) {
    try {
      return NextResponse.json(
        localListTenants({
          searchParams: request.nextUrl.searchParams,
        }),
      );
    } catch (error) {
      return toApiErrorResponse(error, {
        fallbackMessage: tServiceDeskApi("api.tenants.fetchList"),
      });
    }
  }

  return portalApiJson(request, {
    path: "/service-desk/tenants",
    query: request.nextUrl.searchParams,
    errorMessage: tServiceDeskApi("api.tenants.fetchList"),
    mapData: mapTenantListPayload,
  });
}

export async function POST(request: NextRequest) {
  const isRemote = await isRemoteRequest(request);
  const parsedBody = createTenantSchema.safeParse(await request.json());

  if (!parsedBody.success) {
    return NextResponse.json(
      { message: tServiceDeskApi("api.tenants.localDemo.invalidPayload") },
      { status: 400 },
    );
  }

  const body = parsedBody.data;

  if (!isRemote) {
    try {
      return NextResponse.json(
        localCreateTenant({
          input: {
            ...body,
            active: body.active ?? true,
            color: body.color ?? "",
          },
        }),
        { status: 201 },
      );
    } catch (error) {
      return toApiErrorResponse(error, {
        fallbackMessage: tServiceDeskApi("api.tenants.create"),
      });
    }
  }

  return portalApiJson(request, {
    method: "POST",
    path: "/service-desk/tenants",
    body: toTenantWritePayload({
      ...body,
      active: body.active ?? true,
      color: body.color ?? "",
    }),
    errorMessage: tServiceDeskApi("api.tenants.create"),
    mapData: mapTenantItemPayload,
  });
}
