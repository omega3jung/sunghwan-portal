import { ServiceDeskApiError } from "@/app/api/service-desk/_shared/messages";

import { findCategoryRowsByTenantIdAndCategoryId } from "../category";
import { getActiveTenantById, getActiveTenants } from "../tenant";
import {
  AssignmentRuleDto,
  CreateAssignmentRuleInputDto,
  UpdateAssignmentRuleInputDto,
} from "./assignmentRuleDto";
import {
  mapAssignmentRuleRowsToDtos,
  mapAssignmentRuleRowToDto,
  mapCreateAssignmentRuleInputDtoToRowInput,
  mapUpdateAssignmentRuleInputDtoToRowInput,
} from "./assignmentRuleMapper";
import {
  createAssignmentRuleRow,
  deleteAssignmentRuleRowById,
  findAssignmentRuleRowByTenantIdAndAssignmentRuleId,
  findAssignmentRuleRowsByTenantId,
  findAssignmentRuleRowsByTenantIdAndCategoryId,
  updateAssignmentRuleRowById,
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

export async function createAssignmentRule(
  input: CreateAssignmentRuleInputDto,
): Promise<AssignmentRuleDto> {
  await assertActiveTenantExists(input.tenant_id);
  await assertActiveCategoryExistsInTenant(input.tenant_id, input.category_id, {
    messageKey: "api.assignmentRules.localDemo.categoryNotFound",
  });

  const duplicateRules = await findAssignmentRuleRowsByTenantIdAndCategoryId(
    input.tenant_id,
    input.category_id,
  );

  if (duplicateRules.length > 0) {
    throw createStatusError(
      `Assignment rule already exists for category ${input.category_id}.`,
      409,
    );
  }

  const row = await createAssignmentRuleRow(
    mapCreateAssignmentRuleInputDtoToRowInput(input),
  );

  if (!row) {
    throw new Error("Failed to create assignment rule.");
  }

  return mapAssignmentRuleRowToDto(row);
}

export async function updateAssignmentRuleById(
  tenantId: string | number,
  assignmentRuleId: string | number,
  input: UpdateAssignmentRuleInputDto,
): Promise<AssignmentRuleDto> {
  const currentRow = await findAssignmentRuleRowByTenantIdAndAssignmentRuleId(
    tenantId,
    assignmentRuleId,
  );

  if (!currentRow) {
    throw new ServiceDeskApiError("api.common.notFound", 404);
  }

  await assertActiveCategoryExistsInTenant(tenantId, input.category_id, {
    messageKey: "api.assignmentRules.localDemo.categoryNotFound",
  });

  const duplicateRules = await findAssignmentRuleRowsByTenantIdAndCategoryId(
    tenantId,
    input.category_id,
  );
  const hasDuplicateRule = duplicateRules.some(
    (row) => Number(row.ar_id) !== Number(currentRow.ar_id),
  );

  if (hasDuplicateRule) {
    throw createStatusError(
      `Assignment rule already exists for category ${input.category_id}.`,
      409,
    );
  }

  const row = await updateAssignmentRuleRowById(
    tenantId,
    assignmentRuleId,
    mapUpdateAssignmentRuleInputDtoToRowInput(input),
  );

  if (!row) {
    throw new ServiceDeskApiError("api.common.notFound", 404);
  }

  return mapAssignmentRuleRowToDto(row);
}

export async function deleteAssignmentRuleById(
  tenantId: string | number,
  assignmentRuleId: string | number,
): Promise<AssignmentRuleDto> {
  const row = await deleteAssignmentRuleRowById(tenantId, assignmentRuleId);

  if (!row) {
    throw new ServiceDeskApiError("api.common.notFound", 404);
  }

  return mapAssignmentRuleRowToDto(row);
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

async function assertActiveTenantExists(tenantId: string | number) {
  const tenant = await getActiveTenantById(tenantId);

  if (!tenant) {
    throw new ServiceDeskApiError("api.common.notFound", 404);
  }

  return tenant;
}

async function assertActiveCategoryExistsInTenant(
  tenantId: string | number,
  categoryId: string | number,
  options: {
    messageKey: string;
  },
): Promise<void> {
  const rows = await findCategoryRowsByTenantIdAndCategoryId(tenantId, categoryId);
  const targetRow = rows.find((row) => Number(row.cat_id) === Number(categoryId));

  if (!targetRow || targetRow.cat_active === false) {
    throw new ServiceDeskApiError(options.messageKey, 404, { categoryId });
  }
}

function createStatusError(message: string, status: number) {
  const error = new Error(message) as Error & { status: number };
  error.status = status;
  return error;
}
