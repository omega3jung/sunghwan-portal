import { getActiveTenantById, getActiveTenants } from "../tenant";
import { AssignmentRuleDto } from "./assignmentRuleDto";
import { mapAssignmentRuleRowsToDtos } from "./assignmentRuleMapper";
import {
  findAssignmentRuleRowsByTenantId,
  findAssignmentRuleRowsByTenantIdAndCategoryId,
} from "./assignmentRuleRepository";

export async function getAssignmentRulesByTenantId(
  tenantId: string | number,
): Promise<AssignmentRuleDto[]> {
  const rows = await findAssignmentRuleRowsByTenantId(tenantId);

  return mapAssignmentRuleRowsToDtos(rows);
}

export type GetAssignmentRulesResponseParams = {
  tenantId?: string | number | null;
  isInternal: boolean;
};

export async function getAssignmentRulesResponseByTenantId({
  tenantId,
  isInternal,
}: GetAssignmentRulesResponseParams): Promise<AssignmentRuleDto[]> {
  const targetTenantId = await resolveTargetTenantId({
    tenantId,
    isInternal,
  });

  return getAssignmentRulesByTenantId(targetTenantId);
}

export type GetAssignmentRuleDetailParams = {
  categoryId: string | number;
  tenantId?: string | number | null;
  isInternal: boolean;
};

export async function getAssignmentRuleByCategoryId({
  categoryId,
  tenantId,
  isInternal,
}: GetAssignmentRuleDetailParams): Promise<AssignmentRuleDto | null> {
  const targetTenantIds = await resolveDetailTargetTenantIds({
    tenantId,
    isInternal,
  });

  for (const targetTenantId of targetTenantIds) {
    const rows = await findAssignmentRuleRowsByTenantIdAndCategoryId(
      targetTenantId,
      categoryId,
    );

    if (!rows.length) {
      continue;
    }

    return mapAssignmentRuleRowsToDtos(rows)[0] ?? null;
  }

  return null;
}

async function resolveTargetTenantId({
  tenantId,
  isInternal: _isInternal,
}: GetAssignmentRulesResponseParams): Promise<number> {
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
}: GetAssignmentRulesResponseParams): Promise<number[]> {
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
