import type { NextResponse as NextResponseType } from "next/server";
import { NextResponse } from "next/server";

import { ApiError } from "@/lib/application/api";
import {
  getBooleanRuleGroupValue,
  getStringRuleGroupValue,
  parseRuleGroupFilter,
} from "@/lib/application/api/query";
import type { SaveServiceDeskCategoryTreePayload } from "@/lib/application/contracts/serviceDesk";
import {
  CategorySettingsResponseDto,
  CreateCategoryInputDto,
  UpdateCategoryInputDto,
} from "@/server/data/serviceDesk/category";
import {
  createCategory,
  getCategorySettingsResponseByTenantId,
  updateCategoryById,
  validateCategoryTreeMutation,
} from "@/server/data/serviceDesk/category";

import { getPortalApiQueryValue } from "../utils";
import {
  createNotFoundResponse,
  parseBooleanQueryValue,
  parseOptionalId,
  requireBody,
  ServiceDeskPortalApiContext,
} from "./serviceDeskPortalApiUtils";
import { resolveAuthorizedSettingsTenant } from "./shared";

type CategoryTreeItem =
  SaveServiceDeskCategoryTreePayload["categories"][number];

const CATEGORY_LIST_PATH_PATTERN = /^\/service-desk\/categories$/;

export async function handleCategoryPortalApi(
  context: ServiceDeskPortalApiContext,
): Promise<NextResponseType> {
  const categoryListMatch = CATEGORY_LIST_PATH_PATTERN.exec(context.path);

  if (!categoryListMatch) {
    return createNotFoundResponse();
  }

  if (categoryListMatch) {
    if (context.method === "GET") {
      const tenantId = getPortalApiQueryValue(
        context.request,
        context.options,
        "tenantId",
      );
      const filter = parseRuleGroupFilter(
        getPortalApiQueryValue(context.request, context.options, "filter"),
      );
      const companyId =
        getPortalApiQueryValue(context.request, context.options, "companyId") ??
        getStringRuleGroupValue(filter, "tenant_company_id");
      const isInternal =
        parseBooleanQueryValue(
          getPortalApiQueryValue(
            context.request,
            context.options,
            "isInternal",
          ),
        ) ?? true;
      const active =
        parseBooleanQueryValue(
          getPortalApiQueryValue(context.request, context.options, "active"),
        ) ??
        getBooleanRuleGroupValue(filter, "active");
      const scope = getPortalApiQueryValue(
        context.request,
        context.options,
        "scope",
      );
      const items = filterCategorySettingsByScope(
        filterCategorySettingsByActive(
          await getCategorySettingsResponseByTenantId({
            tenantId,
            companyId,
            isInternal,
          }),
          active,
        ),
        scope,
      );

      return NextResponse.json({
        items,
        total: items.length,
      });
    }

    if (context.method === "PUT") {
      const body = requireBody<SaveServiceDeskCategoryTreePayload>(
        context.options,
      );
      const authorization = await resolveAuthorizedSettingsTenant({
        request: context.request,
        requestedTenantId: body.tenantId,
      });
      const tenant = authorization.tenant;

      if (!tenant) {
        throw Object.assign(new Error("A target tenant is required."), {
          status: 400,
        });
      }

      await validateCategoryTreeMutation({
        principal: authorization.principal,
        tenant,
        payload: body,
      });

      const categoryTree = await saveCategoryTree(body);

      return NextResponse.json(categoryTree);
    }

    return createNotFoundResponse();
  }

  return createNotFoundResponse();
}
function filterCategorySettingsByScope(
  items: CategorySettingsResponseDto[],
  scope: string | null,
) {
  if (scope !== "INTERNAL" && scope !== "PORTAL") {
    return items;
  }

  return items.map((tenant) => ({
    ...tenant,
    category: tenant.category.filter(
      (category) => category.category_scope === scope,
    ),
  }));
}

function filterCategorySettingsByActive(
  items: CategorySettingsResponseDto[],
  active: boolean | null,
) {
  if (active === null) {
    return items;
  }

  return items.map((tenant) => ({
    ...tenant,
    category: tenant.category
      .filter((category) => category.category_active === active)
      .map((category) => ({
        ...category,
        sub_category: category.sub_category.filter(
          (subCategory) => subCategory.category_active === active,
        ),
      })),
  }));
}

async function saveCategoryTree(payload: SaveServiceDeskCategoryTreePayload) {
  const tenantId = Number(payload.tenantId);

  for (const [index, category] of payload.categories.entries()) {
    const submittedCategoryId = parseOptionalId(category.id);

    if (submittedCategoryId === null) {
      await createCategory(
        mapCategoryTreeItemToCreateInput(tenantId, category, index + 1),
      );
      continue;
    }

    await updateCategoryById(
      tenantId,
      submittedCategoryId,
      mapCategoryTreeItemToUpdateInput(category, index + 1),
    );
  }

  const tenantCategoryTree = (
    await getCategorySettingsResponseByTenantId({
      tenantId,
      isInternal: true,
    })
  ).find((tenant) => tenant.tenant_id === tenantId);

  if (!tenantCategoryTree) {
    throw new ApiError("serviceDesk.common.notFound", 404);
  }

  return tenantCategoryTree;
}

function mapCategoryTreeItemToCreateInput(
  tenantId: number,
  category: CategoryTreeItem,
  categoryIndex: number,
): CreateCategoryInputDto {
  return {
    category_tenant_id: tenantId,
    category_name: category.name,
    category_description: category.description ?? null,
    category_request_template: category.requestTemplate ?? null,
    category_scope: category.scope,
    category_index: categoryIndex,
    category_active: category.active,
    default_priority: category.defaultPriority,
    default_risk_level: category.defaultRiskLevel,
    default_sla_days: category.defaultSlaDays,
    sub_category: category.subCategories.map((subCategory, index) => ({
      category_id: parseOptionalId(subCategory.id) ?? undefined,
      category_name: subCategory.name,
      category_description: subCategory.description ?? null,
      category_request_template: subCategory.requestTemplate ?? null,
      category_index: index + 1,
      category_active: subCategory.active,
      default_priority: subCategory.defaultPriority ?? null,
      default_risk_level: subCategory.defaultRiskLevel ?? null,
      default_sla_days: subCategory.defaultSlaDays ?? null,
    })),
  };
}
function mapCategoryTreeItemToUpdateInput(
  category: CategoryTreeItem,
  categoryIndex: number,
): UpdateCategoryInputDto {
  return {
    category_name: category.name,
    category_description: category.description ?? null,
    category_request_template: category.requestTemplate ?? null,
    category_scope: category.scope,
    category_index: categoryIndex,
    category_active: category.active,
    default_priority: category.defaultPriority,
    default_risk_level: category.defaultRiskLevel,
    default_sla_days: category.defaultSlaDays,
    sub_category: category.subCategories.map((subCategory, index) => ({
      category_id: parseOptionalId(subCategory.id) ?? undefined,
      category_name: subCategory.name,
      category_description: subCategory.description ?? null,
      category_request_template: subCategory.requestTemplate ?? null,
      category_index: index + 1,
      category_active: subCategory.active,
      default_priority: subCategory.defaultPriority ?? null,
      default_risk_level: subCategory.defaultRiskLevel ?? null,
      default_sla_days: subCategory.defaultSlaDays ?? null,
    })),
  };
}
