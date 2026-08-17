import type { NextResponse as NextResponseType } from "next/server";
import { NextResponse } from "next/server";

import { ApiError } from "@/lib/application/api";
import {
  getBooleanRuleGroupValue,
  getStringRuleGroupValue,
  parseRuleGroupFilter,
} from "@/lib/application/api/query";
import type { SaveServiceDeskCategoryTreePayload } from "@/lib/application/contracts/serviceDesk";
import { canAccessOperationalServiceDeskCategory } from "@/lib/application/serviceDesk";
import {
  CategorySettingsResponseDto,
  CreateCategoryInputDto,
  UpdateCategoryInputDto,
} from "@/server/data/serviceDesk/category";
import {
  createCategory,
  getCategorySettingsResponseByTenantId,
  getCategoryTreeByTenantId,
  getServiceDeskCategoryContext as getRemoteServiceDeskCategoryContext,
  updateCategoryById,
  validateCategoryTreeMutation,
} from "@/server/data/serviceDesk/category";
import { mapSettingsWriteError } from "@/server/data/serviceDesk/shared";
import {
  type PortalApiQueryExecutor,
  withPortalApiTransaction,
} from "@/server/shared/supabase/portalApiClient";

import { getPortalApiQueryValue } from "../utils";
import {
  createNotFoundResponse,
  parseBooleanQueryValue,
  parseOptionalId,
  requireBody,
  ServiceDeskPortalApiContext,
} from "./serviceDeskPortalApiUtils";
import {
  resolveAuthorizedSettingsTenant,
  resolveServiceDeskRequestContext,
} from "./shared";

type CategoryTreeItem =
  SaveServiceDeskCategoryTreePayload["categories"][number];

const CATEGORY_LIST_PATH_PATTERN = /^\/service-desk\/categories$/;
const CATEGORY_CONTEXT_PATH_PATTERN =
  /^\/service-desk\/categories\/([^/]+)\/context$/;

/** Routes category-tree reads and writes while enforcing operational versus settings scope. */
export async function handleCategoryPortalApi(
  context: ServiceDeskPortalApiContext,
): Promise<NextResponseType> {
  const categoryContextMatch = CATEGORY_CONTEXT_PATH_PATTERN.exec(context.path);

  if (categoryContextMatch) {
    if (context.method !== "GET") {
      return createNotFoundResponse();
    }

    const categoryId = decodeURIComponent(categoryContextMatch[1] ?? "");
    const categoryContext =
      await getRemoteServiceDeskCategoryContext(categoryId);

    if (categoryContext) {
      const { principal } = await resolveServiceDeskRequestContext(
        context.request,
      );

      if (
        !canAccessOperationalServiceDeskCategory({
          principal,
          category: categoryContext,
        })
      ) {
        return createNotFoundResponse();
      }
    }

    return categoryContext
      ? NextResponse.json(categoryContext)
      : createNotFoundResponse();
  }

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
        ) ?? getBooleanRuleGroupValue(filter, "active");
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

      try {
        await withPortalApiTransaction(async (query) => {
          await validateCategoryTreeMutation({
            principal: authorization.principal,
            tenant,
            payload: body,
            query,
          });
          await assertCategoryChangeImpactAcknowledged(body, query);
          await saveCategoryTreeInTransaction(body, query);
        });
      } catch (error) {
        throw mapSettingsWriteError(error, "categories");
      }

      const categoryTree = await loadSavedCategoryTree(body);

      return NextResponse.json(categoryTree);
    }

    return createNotFoundResponse();
  }

  return createNotFoundResponse();
}

async function assertCategoryChangeImpactAcknowledged(
  payload: SaveServiceDeskCategoryTreePayload,
  query: PortalApiQueryExecutor,
) {
  const currentTree = await getCategoryTreeByTenantId(payload.tenantId, query);
  const changedIds = payload.categories.flatMap((category) => {
    const current = currentTree.find(
      (item) => String(item.category_id) === category.id,
    );
    if (!current) return [];
    const ids: number[] = [];
    if (hasMainCategoryChanged(current, category)) {
      ids.push(current.category_id);
    }
    for (const subCategory of category.subCategories) {
      const currentSubCategory = current.sub_category.find(
        (item) => String(item.category_id) === subCategory.id,
      );
      if (
        currentSubCategory &&
        JSON.stringify({
          name: currentSubCategory.category_name,
          description: currentSubCategory.category_description,
          requestTemplate: currentSubCategory.category_request_template,
          index: currentSubCategory.category_index,
          active: currentSubCategory.category_active,
          defaultPriority: currentSubCategory.default_priority ?? null,
          defaultRiskLevel: currentSubCategory.default_risk_level ?? null,
          defaultSlaDays: currentSubCategory.default_sla_days ?? null,
        }) !==
          JSON.stringify({
            name: subCategory.name,
            description: subCategory.description ?? null,
            requestTemplate: subCategory.requestTemplate ?? null,
            index: subCategory.index,
            active: subCategory.active,
            defaultPriority: subCategory.defaultPriority ?? null,
            defaultRiskLevel: subCategory.defaultRiskLevel ?? null,
            defaultSlaDays: subCategory.defaultSlaDays ?? null,
          })
      ) {
        ids.push(currentSubCategory.category_id);
      }
    }
    return ids;
  });

  if (changedIds.length === 0 || payload.force === true) return;

  const rows = await query<{ count: number | string }>(
    `
select count(*)::int as count
from service_desk.ticket ticket
join service_desk.category category
  on category.cat_id = ticket.tk_category_id
where ticket.tk_active = true
  and ticket.tk_status not in ('Draft', 'Closed')
  and (
    category.cat_id = any($1::bigint[])
    or category.cat_parent_id = any($1::bigint[])
  );
`,
    [changedIds],
  );

  if (Number(rows[0]?.count ?? 0) > 0) {
    throw Object.assign(new Error("Category changes affect active tickets."), {
      code: "CATEGORY_CHANGE_IMPACT",
      status: 409,
    });
  }
}

function hasMainCategoryChanged(
  current: Awaited<ReturnType<typeof getCategoryTreeByTenantId>>[number],
  submitted: CategoryTreeItem,
) {
  return (
    JSON.stringify({
      name: current.category_name,
      description: current.category_description,
      requestTemplate: current.category_request_template,
      scope: current.category_scope,
      index: current.category_index,
      active: current.category_active,
      defaultPriority: current.default_priority,
      defaultRiskLevel: current.default_risk_level,
      defaultSlaDays: current.default_sla_days,
    }) !==
    JSON.stringify({
      name: submitted.name,
      description: submitted.description ?? null,
      requestTemplate: submitted.requestTemplate ?? null,
      scope: submitted.scope,
      index: submitted.index,
      active: submitted.active,
      defaultPriority: submitted.defaultPriority,
      defaultRiskLevel: submitted.defaultRiskLevel,
      defaultSlaDays: submitted.defaultSlaDays,
    })
  );
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

export async function saveCategoryTreeInTransaction(
  payload: SaveServiceDeskCategoryTreePayload,
  query: PortalApiQueryExecutor,
) {
  const tenantId = Number(payload.tenantId);

  for (const [index, category] of payload.categories.entries()) {
    const submittedCategoryId = parseOptionalId(category.id);

    if (submittedCategoryId === null) {
      await createCategory(
        mapCategoryTreeItemToCreateInput(tenantId, category, index + 1),
        query,
      );
      continue;
    }

    await updateCategoryById(
      tenantId,
      submittedCategoryId,
      mapCategoryTreeItemToUpdateInput(category, index + 1),
      query,
    );
  }
}

async function loadSavedCategoryTree(
  payload: SaveServiceDeskCategoryTreePayload,
) {
  const tenantId = Number(payload.tenantId);
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
