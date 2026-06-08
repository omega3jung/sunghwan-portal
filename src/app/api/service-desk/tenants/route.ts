import { NextRequest, NextResponse } from "next/server";

import { getAuthToken } from "@/app/api/_helpers";
import {
  camelTenantMapper,
  mapTenantListPayload,
} from "@/feature/serviceDesk/tenant/mapper";
import {
  clientTenantsMock,
  internalTenantMock,
} from "@/mocks/domain/serviceDesk/tenants";

import { portalApiJson } from "../../_helpers/portalApiJson";

export async function GET(request: NextRequest) {
  const token = await getAuthToken(request);
  const isRemote = token?.dataScope === "REMOTE";

  if (!isRemote) {
    const items = camelTenantMapper(
      [internalTenantMock, ...clientTenantsMock].sort(
        (a, b) => a.tenant_id - b.tenant_id,
      ),
    );

    return NextResponse.json({
      items,
      total: items.length,
    });
  }

  return portalApiJson(request, {
    path: "/service-desk/tenants",
    query: request.nextUrl.searchParams,
    errorMessage: "Failed to fetch tenants",
    mapData: mapTenantListPayload,
  });
}
