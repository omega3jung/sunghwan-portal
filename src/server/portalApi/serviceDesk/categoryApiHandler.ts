import type { NextResponse as NextResponseType } from "next/server";
import { NextResponse } from "next/server";

import { ServiceDeskApiError } from "@/app/api/service-desk/_shared/messages";
import type {
  DbCategory,
  SaveServiceDeskCategoryTreePayload,
} from "@/feature/serviceDesk/category/types";
import {
  CategoryDto,
  CategorySubCategoryInputDto,
  CreateCategoryInputDto,
  UpdateCategoryInputDto,
} from "@/server/data/serviceDesk/category";
import {
  createCategory,
  deactivateCategoryById,
  getCategoryById,
  getCategorySettingsResponseByTenantId,
  getCategoryTreeByTenantId,
  updateCategoryById,
} from "@/server/data/serviceDesk/category";

import { getPortalApiQueryValue } from "../utils";
import {
  resolveCreateCategoryTenantId,
  resolveTenantIdByCategoryId,
} from "./serviceDeskPortalApiResolvers";
import {
  createNotFoundResponse,
  parseBooleanQueryValue,
  parseOptionalId,
  parseOptionalNumber,
  requireBody,
  ServiceDeskPortalApiContext,
} from "./serviceDeskPortalApiShared";

type CategoryTreeItem =
  SaveServiceDeskCategoryTreePayload["categories"][number];

const CATEGORY_LIST_PATH_PATTERN = /^\/service-desk\/categories$/;
const CATEGORY_TREE_PATH_PATTERN =
  /^\/service-desk\/categories\/tenant\/([^/]+)$/;
const CATEGORY_DETAIL_PATH_PATTERN = /^\/service-desk\/categories\/([^/]+)$/;

export async function handleCategoryPortalApi(
  context: ServiceDeskPortalApiContext,
): Promise<NextResponseType> {
  const categoryListMatch = CATEGORY_LIST_PATH_PATTERN.exec(context.path);
  const categoryTreeMatch = CATEGORY_TREE_PATH_PATTERN.exec(context.path);
  const categoryDetailMatch = CATEGORY_DETAIL_PATH_PATTERN.exec(context.path);

  if (!categoryListMatch && !categoryTreeMatch && !categoryDetailMatch) {
    return createNotFoundResponse();
  }

  if (categoryListMatch) {
    if (context.method === "GET") {
      const tenantId = getPortalApiQueryValue(
        context.request,
        context.options,
        "tenantId",
      );
      const isInternal =
        parseBooleanQueryValue(
          getPortalApiQueryValue(
            context.request,
            context.options,
            "isInternal",
          ),
        ) ?? true;
      const items = await getCategorySettingsResponseByTenantId({
        tenantId,
        isInternal,
      });

      return NextResponse.json({
        items,
        total: items.length,
      });
    }

    if (context.method === "POST") {
      const tenantId = await resolveCreateCategoryTenantId(context);
      const body = requireBody<DbCategory>(context.options);
      const category = await createCategory(
        mapCategoryBodyToCreateInput(tenantId, body),
      );

      return NextResponse.json(category, { status: 201 });
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

  if (categoryTreeMatch) {
    if (context.method !== "GET") {
      return createNotFoundResponse();
    }

    const tenantId = decodeURIComponent(categoryTreeMatch[1] ?? "");
    const categories = await getCategoryTreeByTenantId(tenantId);

    return NextResponse.json({ data: categories });
  }

  const categoryId = decodeURIComponent(categoryDetailMatch?.[1] ?? "");

  if (context.method === "GET") {
    const tenantId = getPortalApiQueryValue(
      context.request,
      context.options,
      "tenantId",
    );
    const isInternal =
      parseBooleanQueryValue(
        getPortalApiQueryValue(context.request, context.options, "isInternal"),
      ) ?? true;
    const category = await getCategoryById({
      categoryId,
      tenantId,
      isInternal,
    });

    if (!category) {
      return createNotFoundResponse();
    }

    return NextResponse.json(category);
  }

  if (context.method === "PUT") {
    const body = requireBody<DbCategory>(context.options);
    const tenantId = await resolveTenantIdByCategoryId(context, categoryId);
    const category = await updateCategoryById(
      tenantId,
      categoryId,
      mapCategoryBodyToUpdateInput(body),
    );

    return NextResponse.json(category);
  }

  if (context.method === "DELETE") {
    const tenantId = await resolveTenantIdByCategoryId(context, categoryId);
    const category = await deactivateCategoryById(tenantId, categoryId);

    return NextResponse.json(category);
  }

  return createNotFoundResponse();
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

function mapCategoryBodyToCreateInput(
  tenantId: number,
  body: DbCategory,
): CreateCategoryInputDto {
  return {
    category_tenant_id: tenantId,
    category_name: body.category_name,
    category_description: body.category_description,
    category_request_template: body.category_request_template,
    category_scope: body.category_scope,
    category_index: body.category_index,
    category_active: body.category_active,
    default_priority: body.default_priority,
    default_risk_level: body.default_risk_level,
    default_sla_days: body.default_sla_days,
    sub_category: body.sub_category.map(mapCategorySubCategoryBodyToInput),
  };
}

function mapCategoryBodyToUpdateInput(
  body: DbCategory,
): UpdateCategoryInputDto {
  return {
    category_name: body.category_name,
    category_description: body.category_description,
    category_request_template: body.category_request_template,
    category_scope: body.category_scope,
    category_index: body.category_index,
    category_active: body.category_active,
    default_priority: body.default_priority,
    default_risk_level: body.default_risk_level,
    default_sla_days: body.default_sla_days,
    sub_category: body.sub_category.map(mapCategorySubCategoryBodyToInput),
  };
}

function mapCategorySubCategoryBodyToInput(
  subCategory: DbCategory["sub_category"][number],
): CategorySubCategoryInputDto {
  return {
    category_id: parseOptionalNumber(subCategory.category_id) ?? undefined,
    category_name: subCategory.category_name,
    category_description: subCategory.category_description,
    category_request_template: subCategory.category_request_template,
    category_index: subCategory.category_index,
    category_active: subCategory.category_active,
    default_priority: subCategory.default_priority,
    default_risk_level: subCategory.default_risk_level,
    default_sla_days: subCategory.default_sla_days,
  };
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
