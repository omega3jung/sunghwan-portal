import { type CategoryScope } from "@/domain/serviceDesk";
import { ApiError } from "@/lib/application/api";
import type { SaveServiceDeskCategoryTreePayload } from "@/lib/application/contracts/serviceDesk";
import {
  canManageServiceDeskSettings,
  resolveSettingsAccess,
  type ServiceDeskSettingsPrincipal,
} from "@/lib/application/serviceDesk";
import {
  assertCategoriesReadyForActivation,
  createServiceDeskStatusError as createStatusError,
} from "@/server/data/serviceDesk/shared";
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

/** Describes the category settings response dto returned across the server boundary. */
export type CategorySettingsResponseDto = TenantDto & {
  category: CategoryDto[];
};

/** Describes the validated get category settings response params accepted by this server operation. */
export type GetCategorySettingsResponseParams = {
  tenantId?: string | number | null;
  companyId?: string | number | null;
  isInternal: boolean;
};

/** Loads category tree by tenant id through the server data boundary. */
export async function getCategoryTreeByTenantId(
  tenantId: string | number,
  query?: PortalApiQueryExecutor,
): Promise<CategoryDto[]> {
  const rows = await findCategoryRowsByTenantId(tenantId, query);

  return mapCategoryRowsToDtos(rows);
}

/** Loads category tree by company id through the server data boundary. */
export async function getCategoryTreeByCompanyId(
  companyId: string | number,
): Promise<CategoryDto[]> {
  const rows = await findCategoryRowsByCompanyId(companyId);

  return mapCategoryRowsToDtos(rows);
}

/** Defines the server-side service desk category context contract used by this module. */
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

/** Loads service desk category context through the server data boundary. */
export async function getServiceDeskCategoryContext(
  categoryId: string | number,
): Promise<ServiceDeskCategoryContext | null> {
  const row = await findCategoryContextRowById(categoryId);

  if (!row) {
    return null;
  }

  const tenant = await getServiceDeskSettingsTenantContext(row.tenant_id);

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

/** Checks that a principal may mutate the requested category tree before any database write. */
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
    const submittedCategoryId = getPersistedCategoryId(category.id);
    const currentCategory = submittedCategoryId
      ? currentCategoriesById.get(submittedCategoryId)
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

    if (submittedCategoryId) {
      if (!currentCategory) {
        throw createStatusError(
          "The submitted category does not belong to the target tenant.",
          400,
        );
      }

      if (submittedCategoryIds.has(submittedCategoryId)) {
        throw createStatusError(
          "A category cannot be submitted more than once.",
          400,
        );
      }

      submittedCategoryIds.add(submittedCategoryId);

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
      const submittedSubCategoryId = getPersistedCategoryId(subCategory.id);

      if (!submittedSubCategoryId) {
        continue;
      }

      if (
        !currentCategory ||
        !currentSubCategoryIds.has(submittedSubCategoryId) ||
        submittedSubCategoryIds.has(submittedSubCategoryId)
      ) {
        throw createStatusError(
          "A subcategory cannot move to another category or tenant.",
          400,
        );
      }

      submittedSubCategoryIds.add(submittedSubCategoryId);
    }
  }
}

/** Validates category identities and nested structure before synchronizing the persisted tree. */
export async function validateCategoryTreeMutation({
  principal,
  tenant,
  payload,
  query,
}: {
  principal: ServiceDeskSettingsPrincipal;
  tenant: ServiceDeskSettingsTenantContext;
  payload: SaveServiceDeskCategoryTreePayload;
  query?: PortalApiQueryExecutor;
}) {
  const categories = await getCategoryTreeByTenantId(tenant.id, query);

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

  await assertCategoriesReadyForActivation(
    tenant.id,
    collectCategoryActivationTargetIds(categories, payload),
    query,
  );
}

function collectCategoryActivationTargetIds(
  currentCategories: CategoryDto[],
  payload: SaveServiceDeskCategoryTreePayload,
) {
  const currentCategoriesById = new Map(
    currentCategories.map((category) => [
      String(category.category_id),
      category,
    ]),
  );
  const categoryIds: string[] = [];

  for (const category of payload.categories) {
    const submittedCategoryId = getPersistedCategoryId(category.id);

    if (!submittedCategoryId) {
      continue;
    }

    const currentCategory = currentCategoriesById.get(submittedCategoryId);

    if (!currentCategory) {
      continue;
    }

    if (!currentCategory.category_active && category.active) {
      categoryIds.push(submittedCategoryId);
    }

    const currentSubCategoriesById = new Map(
      currentCategory.sub_category.map((subCategory) => [
        String(subCategory.category_id),
        subCategory,
      ]),
    );

    for (const subCategory of category.subCategories) {
      const submittedSubCategoryId = getPersistedCategoryId(subCategory.id);

      if (!submittedSubCategoryId) {
        continue;
      }

      const currentSubCategory = currentSubCategoriesById.get(
        submittedSubCategoryId,
      );

      if (
        currentSubCategory &&
        !currentSubCategory.category_active &&
        subCategory.active
      ) {
        categoryIds.push(submittedSubCategoryId);
      }
    }
  }

  return categoryIds;
}

function getPersistedCategoryId(id?: string) {
  if (!id) {
    return null;
  }

  const parsedId = Number(id);

  return Number.isSafeInteger(parsedId) && parsedId > 0
    ? String(parsedId)
    : null;
}

/** Loads category settings response by tenant id through the server data boundary. */
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

/** Creates category through the server persistence boundary. */
export async function createCategory(
  input: CreateCategoryInputDto,
  query?: PortalApiQueryExecutor,
): Promise<CategoryDto> {
  await assertActiveTenantExists(input.category_tenant_id, query);

  const inactiveInput: CreateCategoryInputDto = {
    ...input,
    category_active: false,
    sub_category: input.sub_category.map((subCategory) => ({
      ...subCategory,
      category_active: false,
    })),
  };

  const parentRow = await createCategoryRow(
    mapCreateCategoryInputDtoToRowInput(inactiveInput),
    query,
  );

  if (!parentRow) {
    throw new Error("Failed to create category.");
  }

  const childRows = await createSubCategoryRows({
    tenantId: input.category_tenant_id,
    parentRow,
    subCategories: inactiveInput.sub_category,
    query,
  });

  return mapCategoryTreeRowsToDto([parentRow, ...childRows], parentRow.cat_id);
}

/** Updates category by id while preserving server-side validation and persistence rules. */
export async function updateCategoryById(
  tenantId: string | number,
  categoryId: string | number,
  input: UpdateCategoryInputDto,
  query?: PortalApiQueryExecutor,
): Promise<CategoryDto> {
  const { parentRow: currentParentRow, childRows: currentChildRows } =
    await getCategoryTreeRowsByTenantIdAndCategoryId(
      tenantId,
      categoryId,
      query,
    );

  if (currentParentRow.cat_scope !== input.category_scope) {
    throw new ApiError("serviceDesk.categories.scopeImmutable", 400);
  }

  const parentRow = await updateCategoryRowById(
    tenantId,
    categoryId,
    mapUpdateCategoryInputDtoToRowInput(input),
    query,
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
    query,
  });

  return mapCategoryTreeRowsToDto([parentRow, ...childRows], parentRow.cat_id);
}

// Owner administrators may target all active tenants; tenant administrators remain fixed to their own tenant.
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

async function assertActiveTenantExists(
  tenantId: string | number,
  query?: PortalApiQueryExecutor,
) {
  const tenant = await getActiveTenantById(tenantId, query);

  if (!tenant) {
    throw new ApiError("serviceDesk.common.notFound", 404);
  }

  return tenant;
}

async function getCategoryTreeRowsByTenantIdAndCategoryId(
  tenantId: string | number,
  categoryId: string | number,
  query?: PortalApiQueryExecutor,
) {
  const rows = await findCategoryRowsByTenantIdAndCategoryId(
    tenantId,
    categoryId,
    query,
  );
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
  query,
}: {
  tenantId: string | number;
  parentRow: CategoryRow;
  subCategories: CategorySubCategoryInputDto[];
  query?: PortalApiQueryExecutor;
}): Promise<CategoryRow[]> {
  const rows: CategoryRow[] = [];

  for (const subCategory of normalizeSubCategoryInputs(subCategories)) {
    const row = await createCategoryRow(
      mapCategorySubCategoryInputDtoToCreateRowInput(
        tenantId,
        parentRow.cat_id,
        subCategory,
      ),
      query,
    );

    if (!row) {
      throw new Error("Failed to create sub category.");
    }

    rows.push(row);
  }

  return rows;
}

// Reuses submitted identities, creates new children, and soft-deactivates omitted children without losing row history.
async function synchronizeSubCategoryRows({
  tenantId,
  parentRow,
  currentParentRow: _currentParentRow,
  currentChildRows,
  subCategories,
  query,
}: {
  tenantId: string | number;
  parentRow: CategoryRow;
  currentParentRow: CategoryRow;
  currentChildRows: CategoryRow[];
  subCategories: CategorySubCategoryInputDto[];
  query?: PortalApiQueryExecutor;
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
      query,
    });

    if (existingChildRow) {
      const updatedChildRow = await updateCategoryRowById(
        tenantId,
        existingChildRow.cat_id,
        mapCategorySubCategoryInputDtoToUpdateRowInput(
          parentRow.cat_id,
          subCategory,
        ),
        query,
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
        {
          ...subCategory,
          category_active: false,
        },
      ),
      query,
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
    if (preservedChildRow.cat_index === desiredIndex) {
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
      }),
      query,
    );

    if (!updatedPreservedChildRow) {
      throw new ApiError("serviceDesk.common.notFound", 404);
    }

    nextPreservedChildRows.push(updatedPreservedChildRow);
  }

  return [...nextSubmittedChildRows, ...nextPreservedChildRows];
}

// Resolves a submitted child only within its current parent to prevent cross-tree row reassignment.
async function resolveExistingSubCategoryRow({
  tenantId,
  subCategoryId,
  currentChildRowsById,
  query,
}: {
  tenantId: string | number;
  subCategoryId?: number;
  currentChildRowsById: Map<number, CategoryRow>;
  query?: PortalApiQueryExecutor;
}): Promise<CategoryRow | null> {
  if (typeof subCategoryId !== "number") {
    return null;
  }

  const currentChildRow = currentChildRowsById.get(Number(subCategoryId));

  if (currentChildRow) {
    return currentChildRow;
  }

  const rows = await findCategoryRowsByTenantIdAndCategoryId(
    tenantId,
    subCategoryId,
    query,
  );
  const existingRow = rows.find(
    (row) => Number(row.cat_id) === Number(subCategoryId),
  );

  if (existingRow) {
    throw new ApiError("serviceDesk.common.notFound", 404);
  }

  return null;
}

// Removes blank entries and assigns the persisted display order from the submitted sequence.
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
