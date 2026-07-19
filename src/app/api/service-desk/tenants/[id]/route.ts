import { NextRequest, NextResponse } from "next/server";

import {
  getAuthToken,
  isRemoteRequest,
  toApiErrorResponse,
} from "@/app/api/_adapters";
import { portalApiJson } from "@/app/api/_adapters/backend";
import { IdRouteContext } from "@/app/api/_adapters/http";
import {
  localGetTenant,
  localSoftDeleteTenant,
  localUpdateTenant,
} from "@/app/api/_adapters/localDemo/serviceDesk/settings/tenant";
import {
  requireServiceDeskSettingsRouteAccess,
  resolveAuthorizedSettingsTenant,
  resolveServiceDeskSettingsAdminContext,
  resolveTenantResourceAccess,
} from "@/app/api/_adapters/serviceDesk";
import { resolveApiErrorMessage } from "@/lib/application/api";
import {
  mapTenantItemPayload,
  toTenantWritePayload,
  updateTenantSchema,
} from "@/lib/application/contracts/serviceDesk";

export async function GET(request: NextRequest, context: IdRouteContext) {
  try {
    await requireServiceDeskSettingsRouteAccess(request);

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
          { message: resolveApiErrorMessage("serviceDesk.common.notFound") },
          { status: 404 },
        );
      }

      return NextResponse.json(tenant);
    }

    return portalApiJson(request, {
      path: `/service-desk/tenants/${id}`,
      errorMessage: resolveApiErrorMessage("serviceDesk.tenants.fetch"),
      mapData: mapTenantItemPayload,
    });
  } catch (error) {
    return toApiErrorResponse(error, {
      fallbackMessage: resolveApiErrorMessage("serviceDesk.tenants.fetch"),
    });
  }
}

export async function PUT(request: NextRequest, context: IdRouteContext) {
  try {
    await requireServiceDeskSettingsRouteAccess(request);
    const { id } = context.params;
    const { principal } =
      await resolveServiceDeskSettingsAdminContext(request);

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
        { message: resolveApiErrorMessage("serviceDesk.tenants.localDemo.invalidPayload") },
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
      errorMessage: resolveApiErrorMessage("serviceDesk.tenants.update"),
      mapData: mapTenantItemPayload,
    });
  } catch (error) {
    return toApiErrorResponse(error, {
      fallbackMessage: resolveApiErrorMessage("serviceDesk.tenants.update"),
    });
  }
}

export async function DELETE(request: NextRequest, context: IdRouteContext) {
  try {
    await requireServiceDeskSettingsRouteAccess(request);
    const { id } = context.params;
    const { principal } =
      await resolveServiceDeskSettingsAdminContext(request);

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
      errorMessage: resolveApiErrorMessage("serviceDesk.tenants.delete"),
    });
  } catch (error) {
    return toApiErrorResponse(error, {
      fallbackMessage: resolveApiErrorMessage("serviceDesk.tenants.delete"),
    });
  }
}
