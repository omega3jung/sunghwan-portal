import type { NextResponse as NextResponseType } from "next/server";
import { NextResponse } from "next/server";

import { ServiceDeskApiError } from "@/app/api/service-desk/_shared/messages";
import type { SaveServiceDeskCategoryTreePayload } from "@/feature/serviceDesk/category/types";
import {
  CategoryDto,
  CategorySettingsResponseDto,
  CreateCategoryInputDto,
  UpdateCategoryInputDto,
} from "@/server/data/serviceDesk/category";
import {
  createCategory,
  getCategorySettingsResponseByTenantId,
  getCategoryTreeByTenantId,
  updateCategoryById,
} from "@/server/data/serviceDesk/category";
import {
  getBooleanRuleGroupValue,
  getStringRuleGroupValue,
  parseRuleGroupFilter,
} from "@/server/shared/query";

import { getPortalApiQueryValue } from "../utils";
import {
  createNotFoundResponse,
  parseBooleanQueryValue,
  parseOptionalId,
  requireBody,
  ServiceDeskPortalApiContext,
} from "./serviceDeskPortalApiUtils";

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
      const items = filterCategorySettingsByActive(
        await getCategorySettingsResponseByTenantId({
          tenantId,
          companyId,
          isInternal,
        }),
        active,
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
      const categoryTree = await saveCategoryTree(body);

      return NextResponse.json(categoryTree);
    }

    return createNotFoundResponse();
  }

  return createNotFoundResponse();
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
  const currentCategories = await getCategoryTreeByTenantId(tenantId);
  const submittedCategoryIds = new Set<number>();

  for (const [index, category] of payload.categories.entries()) {
    const submittedCategoryId = parseOptionalId(category.id);

    if (submittedCategoryId === null) {
      const createdCategory = await createCategory(
        mapCategoryTreeItemToCreateInput(tenantId, category, index + 1),
      );
      submittedCategoryIds.add(createdCategory.category_id);
      continue;
    }

    const updatedCategory = await updateCategoryById(
      tenantId,
      submittedCategoryId,
      mapCategoryTreeItemToUpdateInput(category, index + 1),
    );
    submittedCategoryIds.add(updatedCategory.category_id);
  }

  const preservedCategories = currentCategories
    .filter((category) => !submittedCategoryIds.has(category.category_id))
    .sort((left, right) => left.category_index - right.category_index);

  for (const [index, category] of preservedCategories.entries()) {
    const desiredIndex = payload.categories.length + index + 1;

    if (category.category_index === desiredIndex) {
      continue;
    }

    await updateCategoryById(
      tenantId,
      category.category_id,
      mapCategoryDtoToUpdateInput(category, desiredIndex),
    );
  }

  const tenantCategoryTree = (
    await getCategorySettingsResponseByTenantId({
      tenantId,
      isInternal: true,
    })
  ).find((tenant) => tenant.tenant_id === tenantId);

  if (!tenantCategoryTree) {
    throw new ServiceDeskApiError("api.common.notFound", 404);
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

function mapCategoryDtoToUpdateInput(
  category: CategoryDto,
  categoryIndex = category.category_index,
): UpdateCategoryInputDto {
  return {
    category_name: category.category_name,
    category_description: category.category_description,
    category_request_template: category.category_request_template,
    category_scope: category.category_scope,
    category_index: categoryIndex,
    category_active: category.category_active,
    default_priority: category.default_priority,
    default_risk_level: category.default_risk_level,
    default_sla_days: category.default_sla_days,
    sub_category: category.sub_category.map((subCategory, index) => ({
      category_id: subCategory.category_id,
      category_name: subCategory.category_name,
      category_description: subCategory.category_description,
      category_request_template: subCategory.category_request_template,
      category_index: index + 1,
      category_active: subCategory.category_active,
      default_priority: subCategory.default_priority ?? null,
      default_risk_level: subCategory.default_risk_level ?? null,
      default_sla_days: subCategory.default_sla_days ?? null,
    })),
  };
}
