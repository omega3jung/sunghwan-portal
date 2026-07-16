import { NextRequest, NextResponse } from "next/server";

import {
  getAuthToken,
  isRemoteRequest,
  toApiErrorResponse,
} from "@/app/api/_adapters";
import { portalApiJson } from "@/app/api/_adapters/backend";
import { localCreateTenant, localListTenants } from "@/app/api/_adapters/localDemo/serviceDesk/settings/tenant";
import {
  requireServiceDeskSettingsAdmin,
  resolveTenantResourceAccess,
} from "@/app/api/_adapters/serviceDesk";
import { resolveApiErrorMessage } from "@/lib/application/api";
import {
  createTenantSchema,
  mapTenantItemPayload,
  mapTenantListPayload,
  toTenantWritePayload,
} from "@/lib/application/contracts/serviceDesk";

export async function GET(request: NextRequest) {
  try {
    const principalContext = await requireServiceDeskSettingsAdmin(request);
    const token = await getAuthToken(request);
    const isRemote = token?.dataScope === "REMOTE";
    const ownCompanyId =
      principalContext.adminType === "TENANT_ADMIN"
        ? String(principalContext.principal.companyId)
        : null;

    if (!isRemote) {
      const response = localListTenants({
        searchParams: request.nextUrl.searchParams,
      });
      const items = ownCompanyId
        ? response.items.filter(
            (tenant) => String(tenant.companyId) === ownCompanyId,
          )
        : response.items;

      return NextResponse.json(
        { items, total: items.length },
      );
    }

    const proxyQuery = new URLSearchParams(request.nextUrl.searchParams);

    if (ownCompanyId) {
      proxyQuery.set("companyId", ownCompanyId);
    } else {
      proxyQuery.delete("companyId");
    }

    return portalApiJson(request, {
      path: "/service-desk/tenants",
      query: proxyQuery,
      errorMessage: resolveApiErrorMessage("serviceDesk.tenants.fetchList"),
      mapData: mapTenantListPayload,
    });
  } catch (error) {
    return toApiErrorResponse(error, {
      fallbackMessage: resolveApiErrorMessage("serviceDesk.tenants.fetchList"),
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { principal } = await requireServiceDeskSettingsAdmin(request);

    if (resolveTenantResourceAccess(principal) !== "manage") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const isRemote = await isRemoteRequest(request);
    const parsedBody = createTenantSchema.safeParse(await request.json());

    if (!parsedBody.success) {
      return NextResponse.json(
        { message: resolveApiErrorMessage("serviceDesk.tenants.localDemo.invalidPayload") },
        { status: 400 },
      );
    }

    const body = parsedBody.data;

    if (!isRemote) {
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
    }

    return portalApiJson(request, {
      method: "POST",
      path: "/service-desk/tenants",
      body: toTenantWritePayload({
        ...body,
        active: body.active ?? true,
        color: body.color ?? "",
      }),
      errorMessage: resolveApiErrorMessage("serviceDesk.tenants.create"),
      mapData: mapTenantItemPayload,
    });
  } catch (error) {
    return toApiErrorResponse(error, {
      fallbackMessage: resolveApiErrorMessage("serviceDesk.tenants.create"),
    });
  }
}
