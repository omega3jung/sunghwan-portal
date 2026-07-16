import {
  type CategoryScope,
} from "@/domain/serviceDesk";
import { ApiError } from "@/lib/application/api";
import type { SaveServiceDeskCategoryTreePayload } from "@/lib/application/contracts/serviceDesk";
import {
  canManageServiceDeskSettings,
  resolveSettingsAccess,
  type ServiceDeskSettingsPrincipal,
} from "@/lib/application/serviceDesk";
import type { PortalApiQueryExecutor } from "@/server/shared/supabase/portalApiClient";

import {
  getActiveTenantByCompanyId,
  getActiveTenantById,
  getActiveTenants,
  getServiceDeskSettingsTenantContext,
  type ServiceDeskSettingsTenantContext,
  TenantDto,
} from "../tenant";
import {
  CategoryDto,
  CategorySubCategoryInputDto,
  CreateCategoryInputDto,
  UpdateCategoryInputDto,
} from "./categoryDto";
import {
  mapCategoryRowsToDtos,
  mapCategorySubCategoryInputDtoToCreateRowInput,
  mapCategorySubCategoryInputDtoToUpdateRowInput,
  mapCreateCategoryInputDtoToRowInput,
  mapUpdateCategoryInputDtoToRowInput,
} from "./categoryMapper";
import {
  createCategoryRow,
  findCategoryContextRowById,
  findCategoryRowsByCompanyId,
  findCategoryRowsByTenantId,
  findCategoryRowsByTenantIdAndCategoryId,
  updateCategoryRowById,
} from "./categoryRepository";
import { CategoryRow, UpdateCategoryRowInput } from "./categoryRow";

export type CategorySettingsResponseDto = TenantDto & {
  category: CategoryDto[];
};

export type GetCategorySettingsResponseParams = {
  tenantId?: string | number | null;
  companyId?: string | number | null;
  isInternal: boolean;
};

export async function getCategoryTreeByTenantId(
  tenantId: string | number,
  query?: PortalApiQueryExecutor,
): Promise<CategoryDto[]> {
  const rows = await findCategoryRowsByTenantId(tenantId, query);

  return mapCategoryRowsToDtos(rows);
}

export async function getCategoryTreeByCompanyId(
  companyId: string | number,
): Promise<CategoryDto[]> {
  const rows = await findCategoryRowsByCompanyId(companyId);

  return mapCategoryRowsToDtos(rows);
}

export type ServiceDeskCategoryContext = {
  categoryId: string;
  mainCategoryId: string;
  scope: CategoryScope;
  tenant: ServiceDeskSettingsTenantContext;
};

type CategoryMutationReference = {
  id: string;
  scope: CategoryScope;
  subCategories: Array<{ id: string }>;
};

export async function getServiceDeskCategoryContext(
  categoryId: string | number,
): Promise<ServiceDeskCategoryContext | null> {
  const row = await findCategoryContextRowById(categoryId);

  if (!row) {
    return null;
  }

  const tenant = await getServiceDeskSettingsTenantContext(
    row.tenant_id,
  );

  if (!tenant) {
    return null;
  }

  return {
    categoryId: String(row.category_id),
    mainCategoryId: String(row.main_category_id),
    scope: row.category_scope,
    tenant,
  };
}

export function assertCategoryTreeMutationAllowed({
  principal,
  tenant,
  currentCategories,
  payload,
}: {
  principal: ServiceDeskSettingsPrincipal;
  tenant: ServiceDeskSettingsTenantContext;
  currentCategories: CategoryMutationReference[];
  payload: SaveServiceDeskCategoryTreePayload;
}) {
  const currentCategoriesById = new Map(
    currentCategories.map((category) => [category.id, category]),
  );
  const submittedCategoryIds = new Set<string>();
  const submittedSubCategoryIds = new Set<string>();

  for (const category of payload.categories) {
    const currentCategory = category.id
      ? currentCategoriesById.get(category.id)
      : undefined;
    const scope = currentCategory?.scope ?? category.scope;
    const access = resolveSettingsAccess(principal, {
      resource: "CATEGORY",
      tenantCompanyId: tenant.companyId,
      isOwnerTenant: tenant.isOwnerTenant,
      scope,
    });

    if (!canManageServiceDeskSettings(access)) {
      throw createStatusError(
        "The submitted category scope is read-only or outside this administrator scope.",
        403,
      );
    }

    if (category.id) {
      if (!currentCategory) {
        throw createStatusError(
          "The submitted category does not belong to the target tenant.",
          400,
        );
      }

      if (submittedCategoryIds.has(category.id)) {
        throw createStatusError(
          "A category cannot be submitted more than once.",
          400,
        );
      }

      submittedCategoryIds.add(category.id);

      if (category.scope !== currentCategory.scope) {
        throw createStatusError(
          "Category scope is immutable. Deactivate the category and create a new one.",
          400,
        );
      }
    }

    const currentSubCategoryIds = new Set(
      currentCategory?.subCategories.map((subCategory) => subCategory.id) ?? [],
    );

    for (const subCategory of category.subCategories) {
      if (!subCategory.id) {
        continue;
      }

      if (
        !currentCategory ||
        !currentSubCategoryIds.has(subCategory.id) ||
        submittedSubCategoryIds.has(subCategory.id)
      ) {
        throw createStatusError(
          "A subcategory cannot move to another category or tenant.",
          400,
        );
      }

      submittedSubCategoryIds.add(subCategory.id);
    }
  }
}

export async function validateCategoryTreeMutation({
  principal,
  tenant,
  payload,
}: {
  principal: ServiceDeskSettingsPrincipal;
  tenant: ServiceDeskSettingsTenantContext;
  payload: SaveServiceDeskCategoryTreePayload;
}) {
  const categories = await getCategoryTreeByTenantId(tenant.id);

  assertCategoryTreeMutationAllowed({
    principal,
    tenant,
    payload,
    currentCategories: categories.map((category) => ({
      id: String(category.category_id),
      scope: category.category_scope,
      subCategories: category.sub_category.map((subCategory) => ({
        id: String(subCategory.category_id),
      })),
    })),
  });
}

export async function getCategorySettingsResponseByTenantId({
  tenantId,
  companyId,
  isInternal,
}: GetCategorySettingsResponseParams): Promise<CategorySettingsResponseDto[]> {
  const targetTenants = await resolveTargetTenants({
    tenantId,
    companyId,
    isInternal,
  });

  return Promise.all(
    targetTenants.map(async (tenant) => ({
      ...tenant,
      category: hasTenantId(companyId)
        ? await getCategoryTreeByCompanyId(companyId)
        : await getCategoryTreeByTenantId(tenant.tenant_id),
    })),
  );
}

export async function createCategory(
  input: CreateCategoryInputDto,
): Promise<CategoryDto> {
  await assertActiveTenantExists(input.category_tenant_id);

  const parentRow = await createCategoryRow(
    mapCreateCategoryInputDtoToRowInput(input),
  );

  if (!parentRow) {
    throw new Error("Failed to create category.");
  }

  const childRows = await createSubCategoryRows({
    tenantId: input.category_tenant_id,
    parentRow,
    subCategories: input.sub_category,
  });

  return mapCategoryTreeRowsToDto([parentRow, ...childRows], parentRow.cat_id);
}

export async function updateCategoryById(
  tenantId: string | number,
  categoryId: string | number,
  input: UpdateCategoryInputDto,
): Promise<CategoryDto> {
  const { parentRow: currentParentRow, childRows: currentChildRows } =
    await getCategoryTreeRowsByTenantIdAndCategoryId(tenantId, categoryId);

  if (currentParentRow.cat_scope !== input.category_scope) {
    throw new ApiError(
      "serviceDesk.categories.scopeImmutable",
      400,
    );
  }

  const parentRow = await updateCategoryRowById(
    tenantId,
    categoryId,
    mapUpdateCategoryInputDtoToRowInput(input),
  );

  if (!parentRow) {
    throw new ApiError("serviceDesk.common.notFound", 404);
  }

  const childRows = await synchronizeSubCategoryRows({
    tenantId,
    parentRow,
    currentParentRow,
    currentChildRows,
    subCategories: input.sub_category,
  });

  return mapCategoryTreeRowsToDto([parentRow, ...childRows], parentRow.cat_id);
}

async function resolveTargetTenants({
  tenantId,
  companyId,
  isInternal,
}: GetCategorySettingsResponseParams): Promise<TenantDto[]> {
  if (hasTenantId(tenantId)) {
    const tenant = await getActiveTenantById(tenantId);

    if (!tenant) {
      throw new Error(`Active tenant not found: ${tenantId}`);
    }

    return [tenant];
  }

  if (hasTenantId(companyId)) {
    const tenant = await getActiveTenantByCompanyId(companyId);

    if (!tenant) {
      throw new Error(`Active tenant not found for company: ${companyId}`);
    }

    return [tenant];
  }

  const tenants = await getActiveTenants();

  if (isInternal) {
    return tenants;
  }

  return tenants.slice(0, 1);
}

function hasTenantId(value?: string | number | null): value is string | number {
  if (value === null || value === undefined) {
    return false;
  }

  return String(value).trim().length > 0;
}

async function assertActiveTenantExists(tenantId: string | number) {
  const tenant = await getActiveTenantById(tenantId);

  if (!tenant) {
    throw new ApiError("serviceDesk.common.notFound", 404);
  }

  return tenant;
}

async function getCategoryTreeRowsByTenantIdAndCategoryId(
  tenantId: string | number,
  categoryId: string | number,
) {
  const rows = await findCategoryRowsByTenantIdAndCategoryId(tenantId, categoryId);
  const parentRow = rows.find(
    (row) =>
      Number(row.cat_id) === Number(categoryId) && row.cat_parent_id === null,
  );

  // Tree save must be able to resubmit inactive categories as well.
  if (!parentRow) {
    throw new ApiError("serviceDesk.common.notFound", 404);
  }

  return {
    parentRow,
    childRows: rows.filter(
      (row) => Number(row.cat_parent_id) === Number(parentRow.cat_id),
    ),
  };
}

async function createSubCategoryRows({
  tenantId,
  parentRow,
  subCategories,
}: {
  tenantId: string | number;
  parentRow: CategoryRow;
  subCategories: CategorySubCategoryInputDto[];
}): Promise<CategoryRow[]> {
  const rows: CategoryRow[] = [];

  for (const subCategory of normalizeSubCategoryInputs(subCategories)) {
    const row = await createCategoryRow(
      mapCategorySubCategoryInputDtoToCreateRowInput(
        tenantId,
        parentRow.cat_id,
        subCategory,
        parentRow.cat_active,
      ),
    );

    if (!row) {
      throw new Error("Failed to create sub category.");
    }

    rows.push(row);
  }

  return rows;
}

async function synchronizeSubCategoryRows({
  tenantId,
  parentRow,
  currentParentRow: _currentParentRow,
  currentChildRows,
  subCategories,
}: {
  tenantId: string | number;
  parentRow: CategoryRow;
  currentParentRow: CategoryRow;
  currentChildRows: CategoryRow[];
  subCategories: CategorySubCategoryInputDto[];
}): Promise<CategoryRow[]> {
  const currentChildRowsById = new Map(
    currentChildRows.map((row) => [Number(row.cat_id), row]),
  );
  const nextSubmittedChildRows: CategoryRow[] = [];
  const submittedChildIds = new Set<number>();

  for (const subCategory of normalizeSubCategoryInputs(subCategories)) {
    const existingChildRow = await resolveExistingSubCategoryRow({
      tenantId,
      subCategoryId: subCategory.category_id,
      currentChildRowsById,
    });

    if (existingChildRow) {
      const updatedChildRow = await updateCategoryRowById(
        tenantId,
        existingChildRow.cat_id,
        mapCategorySubCategoryInputDtoToUpdateRowInput(
          parentRow.cat_id,
          subCategory,
          parentRow.cat_active,
        ),
      );

      if (!updatedChildRow) {
        throw new ApiError("serviceDesk.common.notFound", 404);
      }

      nextSubmittedChildRows.push(updatedChildRow);
      submittedChildIds.add(Number(updatedChildRow.cat_id));
      continue;
    }

    const createdChildRow = await createCategoryRow(
      mapCategorySubCategoryInputDtoToCreateRowInput(
        tenantId,
        parentRow.cat_id,
        subCategory,
        parentRow.cat_active,
      ),
    );

    if (!createdChildRow) {
      throw new Error("Failed to create sub category.");
    }

    nextSubmittedChildRows.push(createdChildRow);
    submittedChildIds.add(Number(createdChildRow.cat_id));
  }

  const preservedChildRows = currentChildRows
    .filter((row) => !submittedChildIds.has(Number(row.cat_id)))
    .sort(compareCategoryRows);
  const nextPreservedChildRows: CategoryRow[] = [];

  for (const [index, preservedChildRow] of preservedChildRows.entries()) {
    if (preservedChildRow.cat_active === false) {
      nextPreservedChildRows.push(preservedChildRow);
      continue;
    }

    const desiredIndex = nextSubmittedChildRows.length + index + 1;
    const desiredActive = parentRow.cat_active
      ? preservedChildRow.cat_active
      : false;

    if (
      preservedChildRow.cat_index === desiredIndex &&
      preservedChildRow.cat_active === desiredActive
    ) {
      nextPreservedChildRows.push(preservedChildRow);
      continue;
    }

    const updatedPreservedChildRow = await updateCategoryRowById(
      tenantId,
      preservedChildRow.cat_id,
      toUpdateCategoryRowInput(preservedChildRow, {
        cat_parent_id: parentRow.cat_id,
        cat_scope: null,
        cat_index: desiredIndex,
        cat_active: desiredActive,
      }),
    );

    if (!updatedPreservedChildRow) {
      throw new ApiError("serviceDesk.common.notFound", 404);
    }

    nextPreservedChildRows.push(updatedPreservedChildRow);
  }

  return [...nextSubmittedChildRows, ...nextPreservedChildRows];
}

async function resolveExistingSubCategoryRow({
  tenantId,
  subCategoryId,
  currentChildRowsById,
}: {
  tenantId: string | number;
  subCategoryId?: number;
  currentChildRowsById: Map<number, CategoryRow>;
}): Promise<CategoryRow | null> {
  if (typeof subCategoryId !== "number") {
    return null;
  }

  const currentChildRow = currentChildRowsById.get(Number(subCategoryId));

  if (currentChildRow) {
    return currentChildRow;
  }

  const rows = await findCategoryRowsByTenantIdAndCategoryId(tenantId, subCategoryId);
  const existingRow = rows.find((row) => Number(row.cat_id) === Number(subCategoryId));

  if (existingRow) {
    throw new ApiError("serviceDesk.common.notFound", 404);
  }

  return null;
}

function normalizeSubCategoryInputs(
  subCategories: CategorySubCategoryInputDto[],
): CategorySubCategoryInputDto[] {
  return subCategories.map((subCategory, index) => ({
    ...subCategory,
    category_index: index + 1,
  }));
}

function mapCategoryTreeRowsToDto(
  rows: CategoryRow[],
  categoryId: string | number,
): CategoryDto {
  const category = mapCategoryRowsToDtos(sortCategoryRows(rows)).find(
    (item) => item.category_id === Number(categoryId),
  );

  if (!category) {
    throw new Error(`Category not found after mapping: ${categoryId}`);
  }

  return category;
}

function sortCategoryRows(rows: CategoryRow[]): CategoryRow[] {
  return [...rows].sort(compareCategoryRows);
}

function compareCategoryRows(left: CategoryRow, right: CategoryRow) {
  const leftGroupId = left.cat_parent_id ?? left.cat_id;
  const rightGroupId = right.cat_parent_id ?? right.cat_id;

  if (leftGroupId !== rightGroupId) {
    return leftGroupId - rightGroupId;
  }

  if (left.cat_parent_id === null && right.cat_parent_id !== null) {
    return -1;
  }

  if (left.cat_parent_id !== null && right.cat_parent_id === null) {
    return 1;
  }

  if (left.cat_index !== right.cat_index) {
    return left.cat_index - right.cat_index;
  }

  return left.cat_id - right.cat_id;
}

function toUpdateCategoryRowInput(
  row: CategoryRow,
  overrides: Partial<UpdateCategoryRowInput>,
): UpdateCategoryRowInput {
  return {
    cat_parent_id: row.cat_parent_id,
    cat_scope: row.cat_scope,
    cat_name: row.cat_name,
    cat_description: row.cat_description,
    cat_request_template: row.cat_request_template,
    cat_index: row.cat_index,
    cat_active: row.cat_active,
    cat_default_priority: row.cat_default_priority,
    cat_default_risk_level: row.cat_default_risk_level,
    cat_default_sla_days: row.cat_default_sla_days,
    ...overrides,
  };
}

function createStatusError(message: string, status: number) {
  return Object.assign(new Error(message), { status });
}
