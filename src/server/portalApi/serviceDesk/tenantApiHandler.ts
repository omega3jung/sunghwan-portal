import type { NextResponse as NextResponseType } from "next/server";
import { NextResponse } from "next/server";

import {
  getBooleanRuleGroupValue,
  parseRuleGroupFilter,
} from "@/lib/application/api/query";
import type { DbTenant } from "@/lib/application/contracts/serviceDesk";
import {
  createTenant,
  deactivateTenantById,
  getServiceDeskSettingsTenantContext,
  getServiceDeskSettingsTenantContextByCompanyId,
  getTenantById,
  getTenants,
  updateTenantById,
} from "@/server/data/serviceDesk/tenant";

import { getPortalApiQueryValue } from "../utils";
import {
  createNotFoundResponse,
  parseBooleanQueryValue,
  requireBody,
  ServiceDeskPortalApiContext,
} from "./serviceDeskPortalApiUtils";

const TENANT_LIST_PATH_PATTERN = /^\/service-desk\/tenants$/;
const TENANT_CONTEXT_BY_COMPANY_PATH_PATTERN =
  /^\/service-desk\/tenants\/context$/;
const TENANT_DETAIL_CONTEXT_PATH_PATTERN =
  /^\/service-desk\/tenants\/([^/]+)\/context$/;
const TENANT_DETAIL_PATH_PATTERN = /^\/service-desk\/tenants\/([^/]+)$/;

export async function handleTenantPortalApi(
  context: ServiceDeskPortalApiContext,
): Promise<NextResponseType> {
  const tenantListMatch = TENANT_LIST_PATH_PATTERN.exec(context.path);
  const tenantContextByCompanyMatch =
    TENANT_CONTEXT_BY_COMPANY_PATH_PATTERN.exec(context.path);
  const tenantDetailContextMatch =
    TENANT_DETAIL_CONTEXT_PATH_PATTERN.exec(context.path);
  const tenantDetailMatch = TENANT_DETAIL_PATH_PATTERN.exec(context.path);

  if (
    !tenantListMatch &&
    !tenantContextByCompanyMatch &&
    !tenantDetailContextMatch &&
    !tenantDetailMatch
  ) {
    return createNotFoundResponse();
  }

  if (tenantDetailContextMatch) {
    if (context.method !== "GET") {
      return createNotFoundResponse();
    }

    const tenantId = decodeURIComponent(tenantDetailContextMatch[1] ?? "");
    const tenant = await getServiceDeskSettingsTenantContext(tenantId);

    return tenant ? NextResponse.json(tenant) : createNotFoundResponse();
  }

  if (tenantContextByCompanyMatch) {
    if (context.method !== "GET") {
      return createNotFoundResponse();
    }

    const companyId = getPortalApiQueryValue(
      context.request,
      context.options,
      "companyId",
    );

    if (!companyId) {
      return NextResponse.json(
        { message: "companyId is required" },
        { status: 400 },
      );
    }

    const tenant =
      await getServiceDeskSettingsTenantContextByCompanyId(companyId);

    return tenant ? NextResponse.json(tenant) : createNotFoundResponse();
  }

  if (tenantListMatch) {
    if (context.method === "GET") {
      const companyId = getPortalApiQueryValue(
        context.request,
        context.options,
        "companyId",
      );
      const active =
        parseBooleanQueryValue(
          getPortalApiQueryValue(context.request, context.options, "active"),
        ) ??
        getBooleanRuleGroupValue(
          parseRuleGroupFilter(
            getPortalApiQueryValue(context.request, context.options, "filter"),
          ),
          "active",
        );
      const items = filterTenantsByCompanyId(
        filterTenantsByActive(await getTenants(), active),
        companyId,
      );

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
    const tenant = await getTenantById(tenantId);

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

function filterTenantsByCompanyId(
  items: DbTenant[],
  companyId: string | null,
) {
  if (!companyId) {
    return items;
  }

  return items.filter(
    (tenant) => String(tenant.tenant_company_id) === companyId,
  );
}

function filterTenantsByActive(items: DbTenant[], active: boolean | null) {
  if (active === null) {
    return items;
  }

  return items.filter((tenant) => (tenant.tenant_active ?? true) === active);
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
