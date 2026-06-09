import type { NextResponse as NextResponseType } from "next/server";
import { NextResponse } from "next/server";

import type { DbTenant } from "@/feature/serviceDesk/tenant/types";
import {
  createTenant,
  deactivateTenantById,
  getActiveTenantById,
  getActiveTenants,
  updateTenantById,
} from "@/server/data/serviceDesk/tenant";

import {
  createNotFoundResponse,
  requireBody,
  ServiceDeskPortalApiContext,
} from "./serviceDeskPortalApiShared";

const TENANT_LIST_PATH_PATTERN = /^\/service-desk\/tenants$/;
const TENANT_DETAIL_PATH_PATTERN = /^\/service-desk\/tenants\/([^/]+)$/;

export async function handleTenantPortalApi(
  context: ServiceDeskPortalApiContext,
): Promise<NextResponseType> {
  const tenantListMatch = TENANT_LIST_PATH_PATTERN.exec(context.path);
  const tenantDetailMatch = TENANT_DETAIL_PATH_PATTERN.exec(context.path);

  if (!tenantListMatch && !tenantDetailMatch) {
    return createNotFoundResponse();
  }

  if (tenantListMatch) {
    if (context.method === "GET") {
      const items = await getActiveTenants();

      return NextResponse.json({
        items,
        total: items.length,
      });
    }

    if (context.method === "POST") {
      const body = requireBody<DbTenant>(context.options);
      const tenant = await createTenant(mapTenantBodyToCreateInput(body));

      return NextResponse.json(tenant, { status: 201 });
    }

    return createNotFoundResponse();
  }

  const tenantId = decodeURIComponent(tenantDetailMatch?.[1] ?? "");

  if (context.method === "GET") {
    const tenant = await getActiveTenantById(tenantId);

    if (!tenant) {
      return createNotFoundResponse();
    }

    return NextResponse.json(tenant);
  }

  if (context.method === "PUT") {
    const body = requireBody<DbTenant>(context.options);
    const tenant = await updateTenantById(
      tenantId,
      mapTenantBodyToUpdateInput(body),
    );

    return NextResponse.json(tenant);
  }

  if (context.method === "DELETE") {
    const tenant = await deactivateTenantById(tenantId);

    return NextResponse.json(tenant);
  }

  return createNotFoundResponse();
}

function mapTenantBodyToCreateInput(body: DbTenant) {
  return {
    tenant_company_id: Number(body.tenant_company_id),
    tenant_name: body.tenant_name,
    tenant_color: body.tenant_color ?? "",
    tenant_active: body.tenant_active ?? true,
  };
}

function mapTenantBodyToUpdateInput(body: DbTenant) {
  return {
    tenant_company_id: Number(body.tenant_company_id),
    tenant_name: body.tenant_name,
    tenant_color: body.tenant_color ?? "",
    tenant_active: body.tenant_active ?? true,
  };
}
