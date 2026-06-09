import { NextRequest, NextResponse } from "next/server";

import {
  getAuthToken,
  isRemoteRequest,
  toApiErrorResponse,
} from "@/app/api/_helpers";
import { portalApiJson } from "@/app/api/_helpers/portalApiJson";
import { IdRouteContext } from "@/app/api/_helpers/types";
import { tServiceDeskApi } from "@/app/api/service-desk/_shared/messages";
import {
  mapTenantItemPayload,
  toTenantWritePayload,
  updateTenantSchema,
} from "@/feature/serviceDesk/tenant";
import {
  localGetTenant,
  localSoftDeleteTenant,
  localUpdateTenant,
} from "@/server/serviceDesk/settings/tenant/localDemo";

export async function GET(request: NextRequest, context: IdRouteContext) {
  const { id } = context.params;
  const token = await getAuthToken(request);
  const isRemote = token?.dataScope === "REMOTE";

  if (!isRemote) {
    try {
      const tenant = localGetTenant({ id });

      if (!tenant) {
        return NextResponse.json(
          { message: tServiceDeskApi("api.common.notFound") },
          { status: 404 },
        );
      }

      return NextResponse.json(tenant);
    } catch (error) {
      return toApiErrorResponse(error, {
        fallbackMessage: tServiceDeskApi("api.tenants.fetch"),
      });
    }
  }

  return portalApiJson(request, {
    path: `/service-desk/tenants/${id}`,
    errorMessage: tServiceDeskApi("api.tenants.fetch"),
    mapData: mapTenantItemPayload,
  });
}

export async function PUT(request: NextRequest, context: IdRouteContext) {
  const { id } = context.params;
  const isRemote = await isRemoteRequest(request);
  const parsedBody = updateTenantSchema.safeParse(await request.json());

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
        localUpdateTenant({
          id,
          input: {
            ...body,
            id,
            active: body.active ?? true,
            color: body.color ?? "",
          },
        }),
      );
    } catch (error) {
      return toApiErrorResponse(error, {
        fallbackMessage: tServiceDeskApi("api.tenants.update"),
      });
    }
  }

  return portalApiJson(request, {
    method: "PUT",
    path: `/service-desk/tenants/${id}`,
    body: toTenantWritePayload({
      ...body,
      id,
      active: body.active ?? true,
      color: body.color ?? "",
    }),
    errorMessage: tServiceDeskApi("api.tenants.update"),
    mapData: mapTenantItemPayload,
  });
}

export async function DELETE(request: NextRequest, context: IdRouteContext) {
  const { id } = context.params;
  const isRemote = await isRemoteRequest(request);

  if (!isRemote) {
    try {
      return NextResponse.json(
        localSoftDeleteTenant({
          id,
        }),
      );
    } catch (error) {
      return toApiErrorResponse(error, {
        fallbackMessage: tServiceDeskApi("api.tenants.delete"),
      });
    }
  }

  return portalApiJson(request, {
    method: "DELETE",
    path: `/service-desk/tenants/${id}`,
    errorMessage: tServiceDeskApi("api.tenants.delete"),
  });
}
