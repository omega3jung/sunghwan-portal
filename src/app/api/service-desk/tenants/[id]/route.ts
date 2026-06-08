import { NextRequest, NextResponse } from "next/server";

import { getAuthToken } from "@/app/api/_helpers";
import { portalApiJson } from "@/app/api/_helpers/portalApiJson";
import { IdRouteContext } from "@/app/api/_helpers/types";
import {
  camelTenantMapper,
  mapTenantItemPayload,
} from "@/feature/serviceDesk/tenant/mapper";
import {
  clientTenantsMock,
  internalTenantMock,
} from "@/mocks/domain/serviceDesk/tenants";

export async function GET(request: NextRequest, context: IdRouteContext) {
  const { id } = context.params;
  const token = await getAuthToken(request);
  const isRemote = token?.dataScope === "REMOTE";

  if (!isRemote) {
    const [tenant] = camelTenantMapper(
      [internalTenantMock, ...clientTenantsMock].filter(
        (item) => item.tenant_id.toString() === id,
      ),
    );

    if (!tenant) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    return NextResponse.json(tenant);
  }

  return portalApiJson(request, {
    path: `/service-desk/tenants/${id}`,
    errorMessage: "Failed to fetch tenant",
    mapData: mapTenantItemPayload,
  });
}
