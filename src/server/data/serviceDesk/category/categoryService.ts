import { getActiveTenantById, getActiveTenants, TenantDto } from "../tenant";
import { CategoryDto } from "./categoryDto";
import { mapCategoryRowsToDtos } from "./categoryMapper";
import {
  findCategoryRowsByTenantId,
  findCategoryRowsByTenantIdAndCategoryId,
} from "./categoryRepository";

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
