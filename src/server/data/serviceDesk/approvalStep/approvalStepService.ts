import { getCategoryTreeByTenantId } from "../category/categoryService";
import { getActiveTenantById, getActiveTenants } from "../tenant";
import {
  ApprovalStepDto,
  CategoryApprovalSettingsDto,
} from "./approvalStepDto";
import { mapApprovalStepRowsToDtos } from "./approvalStepMapper";
import {
  findApprovalStepRowsByTenantId,
  findApprovalStepRowsByTenantIdAndApprovalStepId,
} from "./approvalStepRepository";

export async function getApprovalStepsByTenantId(
  tenantId: string | number,
): Promise<ApprovalStepDto[]> {
  const rows = await findApprovalStepRowsByTenantId(tenantId);

  return mapApprovalStepRowsToDtos(rows);
}

export type GetApprovalSettingsResponseParams = {
  tenantId?: string | number | null;
  isInternal: boolean;
};

export async function getCategoryApprovalSettingsByTenantId(
  tenantId: string | number,
): Promise<CategoryApprovalSettingsDto[]> {
  const [categories, approvalSteps] = await Promise.all([
    getCategoryTreeByTenantId(tenantId),
    getApprovalStepsByTenantId(tenantId),
  ]);
  const approvalStepsByCategoryId = new Map<number, ApprovalStepDto[]>();

  for (const approvalStep of approvalSteps) {
    const items = approvalStepsByCategoryId.get(approvalStep.category_id) ?? [];

    items.push(approvalStep);
    approvalStepsByCategoryId.set(approvalStep.category_id, items);
  }

  return categories.map(({ sub_category: _subCategory, ...category }) => ({
    ...category,
    approval_step: approvalStepsByCategoryId.get(category.category_id) ?? [],
  }));
}

export async function getApprovalSettingsResponseByTenantId({
  tenantId,
  isInternal,
}: GetApprovalSettingsResponseParams): Promise<CategoryApprovalSettingsDto[]> {
  const targetTenantId = await resolveTargetTenantId({
    tenantId,
    isInternal,
  });

  return getCategoryApprovalSettingsByTenantId(targetTenantId);
}

export type GetApprovalStepDetailParams = {
  approvalStepId: string | number;
  tenantId?: string | number | null;
  isInternal: boolean;
};

export async function getApprovalStepById({
  approvalStepId,
  tenantId,
  isInternal,
}: GetApprovalStepDetailParams): Promise<ApprovalStepDto | null> {
  const targetTenantIds = await resolveDetailTargetTenantIds({
    tenantId,
    isInternal,
  });

  for (const targetTenantId of targetTenantIds) {
    const rows = await findApprovalStepRowsByTenantIdAndApprovalStepId(
      targetTenantId,
      approvalStepId,
    );

    if (!rows.length) {
      continue;
    }

    const approvalStep = mapApprovalStepRowsToDtos(rows)[0] ?? null;

    if (!approvalStep || approvalStep.approval_step_active === false) {
      return null;
    }

    return approvalStep;
  }

  return null;
}

async function resolveTargetTenantId({
  tenantId,
  isInternal: _isInternal,
}: GetApprovalSettingsResponseParams): Promise<number> {
  if (hasTenantId(tenantId)) {
    const tenant = await getActiveTenantById(tenantId);

    if (!tenant) {
      throw new Error(`Active tenant not found: ${tenantId}`);
    }

    return tenant.tenant_id;
  }

  const tenant = (await getActiveTenants())[0];

  if (!tenant) {
    throw new Error("Active tenant not found");
  }

  return tenant.tenant_id;
}

async function resolveDetailTargetTenantIds({
  tenantId,
  isInternal,
}: GetApprovalSettingsResponseParams): Promise<number[]> {
  if (hasTenantId(tenantId)) {
    const tenant = await getActiveTenantById(tenantId);

    if (!tenant) {
      throw new Error(`Active tenant not found: ${tenantId}`);
    }

    return [tenant.tenant_id];
  }

  const tenants = await getActiveTenants();

  if (isInternal) {
    return tenants.map((tenant) => tenant.tenant_id);
  }

  return tenants.slice(0, 1).map((tenant) => tenant.tenant_id);
}

function hasTenantId(value?: string | number | null): value is string | number {
  if (value === null || value === undefined) {
    return false;
  }

  return String(value).trim().length > 0;
}
