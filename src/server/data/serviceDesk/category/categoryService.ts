import { ServiceDeskApiError } from "@/app/api/service-desk/_shared/messages";

import { getActiveTenantById, getActiveTenants, TenantDto } from "../tenant";
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
  deactivateCategoryRowById,
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
  isInternal: boolean;
};

export async function getCategoryTreeByTenantId(
  tenantId: string | number,
): Promise<CategoryDto[]> {
  const rows = await findCategoryRowsByTenantId(tenantId);

  return mapCategoryRowsToDtos(rows);
}

export async function getCategorySettingsResponseByTenantId({
  tenantId,
  isInternal,
}: GetCategorySettingsResponseParams): Promise<CategorySettingsResponseDto[]> {
  const targetTenants = await resolveTargetTenants({
    tenantId,
    isInternal,
  });

  return Promise.all(
    targetTenants.map(async (tenant) => ({
      ...tenant,
      category: await getCategoryTreeByTenantId(tenant.tenant_id),
    })),
  );
}

export type GetCategoryDetailParams = {
  categoryId: string | number;
  tenantId?: string | number | null;
  isInternal: boolean;
};

export async function getCategoryById({
  categoryId,
  tenantId,
  isInternal,
}: GetCategoryDetailParams): Promise<CategoryDto | null> {
  const targetTenants = await resolveDetailTargetTenants({
    tenantId,
    isInternal,
  });

  for (const tenant of targetTenants) {
    const rows = await findCategoryRowsByTenantIdAndCategoryId(
      tenant.tenant_id,
      categoryId,
    );

    if (!rows.length) {
      continue;
    }

    const hasMainCategory = rows.some(
      (row) =>
        Number(row.cat_id) === Number(categoryId) && row.cat_parent_id === null,
    );

    if (!hasMainCategory) {
      continue;
    }

    return (
      mapCategoryRowsToDtos(rows).find(
        (category) => category.category_id === Number(categoryId),
      ) ?? null
    );
  }

  return null;
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
    await getActiveCategoryTreeRowsByTenantIdAndCategoryId(tenantId, categoryId);

  const parentRow = await updateCategoryRowById(
    tenantId,
    categoryId,
    mapUpdateCategoryInputDtoToRowInput(input),
  );

  if (!parentRow) {
    throw new ServiceDeskApiError("api.common.notFound", 404);
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

export async function deactivateCategoryById(
  tenantId: string | number,
  categoryId: string | number,
): Promise<CategoryDto> {
  const { childRows } = await getActiveCategoryTreeRowsByTenantIdAndCategoryId(
    tenantId,
    categoryId,
  );

  const parentRow = await deactivateCategoryRowById(tenantId, categoryId);

  if (!parentRow) {
    throw new ServiceDeskApiError("api.common.notFound", 404);
  }

  const nextChildRows: CategoryRow[] = [];

  for (const childRow of childRows) {
    if (childRow.cat_active === false) {
      nextChildRows.push(childRow);
      continue;
    }

    const deactivatedChildRow = await deactivateCategoryRowById(
      tenantId,
      childRow.cat_id,
    );

    if (!deactivatedChildRow) {
      throw new ServiceDeskApiError("api.common.notFound", 404);
    }

    nextChildRows.push(deactivatedChildRow);
  }

  return mapCategoryTreeRowsToDto(
    [parentRow, ...nextChildRows],
    parentRow.cat_id,
  );
}

async function resolveTargetTenants({
  tenantId,
  isInternal,
}: GetCategorySettingsResponseParams): Promise<TenantDto[]> {
  if (hasTenantId(tenantId)) {
    const tenant = await getActiveTenantById(tenantId);

    if (!tenant) {
      throw new Error(`Active tenant not found: ${tenantId}`);
    }

    return [tenant];
  }

  const tenants = await getActiveTenants();

  if (isInternal) {
    return tenants;
  }

  return tenants.slice(0, 1);
}

async function resolveDetailTargetTenants({
  tenantId,
  isInternal,
}: GetCategorySettingsResponseParams): Promise<TenantDto[]> {
  if (hasTenantId(tenantId)) {
    const tenant = await getActiveTenantById(tenantId);

    if (!tenant) {
      throw new Error(`Active tenant not found: ${tenantId}`);
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
    throw new ServiceDeskApiError("api.common.notFound", 404);
  }

  return tenant;
}

async function getActiveCategoryTreeRowsByTenantIdAndCategoryId(
  tenantId: string | number,
  categoryId: string | number,
) {
  const rows = await findCategoryRowsByTenantIdAndCategoryId(tenantId, categoryId);
  const parentRow = rows.find(
    (row) =>
      Number(row.cat_id) === Number(categoryId) && row.cat_parent_id === null,
  );

  if (!parentRow || parentRow.cat_active === false) {
    throw new ServiceDeskApiError("api.common.notFound", 404);
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
        throw new ServiceDeskApiError("api.common.notFound", 404);
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
      throw new ServiceDeskApiError("api.common.notFound", 404);
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
    throw new ServiceDeskApiError("api.common.notFound", 404);
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
