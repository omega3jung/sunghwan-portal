import { NextRequest, NextResponse } from "next/server";

import {
  getAuthToken,
  isRemoteRequest,
  toApiErrorResponse,
} from "@/app/api/_helpers";
import { portalApiJson } from "@/app/api/_helpers/portalApiJson";
import { IdRouteContext } from "@/app/api/_helpers/types";
import {
  requireServiceDeskSettingsAdmin,
  resolveAuthorizedSettingsTenant,
  resolveTenantResourceAccess,
} from "@/app/api/service-desk/_shared";
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
  try {
    const { id } = context.params;
    await resolveAuthorizedSettingsTenant({
      request,
      requestedTenantId: id,
    });
    const token = await getAuthToken(request);
    const isRemote = token?.dataScope === "REMOTE";

    if (!isRemote) {
      const tenant = localGetTenant({ id });

      if (!tenant) {
        return NextResponse.json(
          { message: tServiceDeskApi("api.common.notFound") },
          { status: 404 },
        );
      }

      return NextResponse.json(tenant);
    }

    return portalApiJson(request, {
      path: `/service-desk/tenants/${id}`,
      errorMessage: tServiceDeskApi("api.tenants.fetch"),
      mapData: mapTenantItemPayload,
    });
  } catch (error) {
    return toApiErrorResponse(error, {
      fallbackMessage: tServiceDeskApi("api.tenants.fetch"),
    });
  }
}

export async function PUT(request: NextRequest, context: IdRouteContext) {
  try {
    const { id } = context.params;
    const { principal } = await requireServiceDeskSettingsAdmin(request);

    if (resolveTenantResourceAccess(principal) !== "manage") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await resolveAuthorizedSettingsTenant({
      request,
      requestedTenantId: id,
    });
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
  } catch (error) {
    return toApiErrorResponse(error, {
      fallbackMessage: tServiceDeskApi("api.tenants.update"),
    });
  }
}

export async function DELETE(request: NextRequest, context: IdRouteContext) {
  try {
    const { id } = context.params;
    const { principal } = await requireServiceDeskSettingsAdmin(request);

    if (resolveTenantResourceAccess(principal) !== "manage") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await resolveAuthorizedSettingsTenant({
      request,
      requestedTenantId: id,
    });
    const isRemote = await isRemoteRequest(request);

    if (!isRemote) {
      return NextResponse.json(
        localSoftDeleteTenant({
          id,
        }),
      );
    }

    return portalApiJson(request, {
      method: "DELETE",
      path: `/service-desk/tenants/${id}`,
      errorMessage: tServiceDeskApi("api.tenants.delete"),
    });
  } catch (error) {
    return toApiErrorResponse(error, {
      fallbackMessage: tServiceDeskApi("api.tenants.delete"),
    });
  }
}
