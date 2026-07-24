import { ApiError } from "@/lib/application/api";
import type { SaveServiceDeskApprovalStepTreePayload } from "@/lib/application/contracts/serviceDesk";
import {
  canManageServiceDeskSettings,
  resolveSettingsAccess,
  type ServiceDeskSettingsPrincipal,
} from "@/lib/application/serviceDesk";
import { createServiceDeskStatusError as createStatusError } from "@/server/data/serviceDesk/shared";
import type { PortalApiQueryExecutor } from "@/server/shared/supabase/portalApiClient";

import {
  getCategoryTreeByTenantId,
  getServiceDeskCategoryContext,
} from "../category/categoryService";
import {
  getActiveTenantById,
  getActiveTenants,
  type ServiceDeskSettingsTenantContext,
} from "../tenant";
import {
  ApprovalStepDto,
  CategoryApprovalSettingsDto,
  CreateApprovalStepInputDto,
  UpdateApprovalStepInputDto,
} from "./approvalStepDto";
import {
  mapApprovalStepRowsToDtos,
  mapApprovalStepRowToDto,
  mapCreateApprovalStepInputDtoToRowInput,
  mapUpdateApprovalStepInputDtoToRowInput,
} from "./approvalStepMapper";
import {
  createApprovalStepRow,
  deleteApprovalStepRowById,
  findApprovalStepRowsByTenantId,
  findApprovalStepRowsByTenantIdAndApprovalStepId,
  updateApprovalStepRowById,
} from "./approvalStepRepository";

export async function getApprovalStepsByTenantId(
  tenantId: string | number,
  query?: PortalApiQueryExecutor,
): Promise<ApprovalStepDto[]> {
  const rows = await findApprovalStepRowsByTenantId(tenantId, query);

  return mapApprovalStepRowsToDtos(rows);
}

export type GetApprovalSettingsResponseParams = {
  tenantId?: string | number | null;
  isInternal: boolean;
};

export async function getCategoryApprovalSettingsByTenantId(
  tenantId: string | number,
  query?: PortalApiQueryExecutor,
): Promise<CategoryApprovalSettingsDto[]> {
  const [categories, approvalSteps] = await Promise.all([
    getCategoryTreeByTenantId(tenantId, query),
    getApprovalStepsByTenantId(tenantId, query),
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

export async function createApprovalStep(
  input: CreateApprovalStepInputDto,
  query?: PortalApiQueryExecutor,
): Promise<ApprovalStepDto> {
  const row = await createApprovalStepRow(
    mapCreateApprovalStepInputDtoToRowInput(input),
    query,
  );

  if (!row) {
    throw new Error("Failed to create approval step.");
  }

  return mapApprovalStepRowToDto(row);
}

export async function updateApprovalStepById(
  tenantId: string | number,
  approvalStepId: string | number,
  input: UpdateApprovalStepInputDto,
  query?: PortalApiQueryExecutor,
): Promise<ApprovalStepDto> {
  const currentRows = await findApprovalStepRowsByTenantIdAndApprovalStepId(
    tenantId,
    approvalStepId,
    query,
  );
  const currentRow = currentRows[0] ?? null;

  if (!currentRow) {
    throw new ApiError("serviceDesk.common.notFound", 404);
  }

  const row = await updateApprovalStepRowById(
    tenantId,
    approvalStepId,
    mapUpdateApprovalStepInputDtoToRowInput(input),
    query,
  );

  if (!row) {
    throw new ApiError("serviceDesk.common.notFound", 404);
  }

  return mapApprovalStepRowToDto(row);
}

export async function deleteApprovalStepById(
  tenantId: string | number,
  approvalStepId: string | number,
  query?: PortalApiQueryExecutor,
): Promise<ApprovalStepDto> {
  const row = await deleteApprovalStepRowById(tenantId, approvalStepId, query);

  if (!row) {
    throw new ApiError("serviceDesk.common.notFound", 404);
  }

  return mapApprovalStepRowToDto(row);
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

function hasTenantId(value?: string | number | null): value is string | number {
  if (value === null || value === undefined) {
    return false;
  }

  return String(value).trim().length > 0;
}

export async function validateApprovalStepTreeMutation({
  principal,
  tenant,
  payload,
}: {
  principal: ServiceDeskSettingsPrincipal;
  tenant: ServiceDeskSettingsTenantContext;
  payload: SaveServiceDeskApprovalStepTreePayload;
}) {
  const currentSettings = await getCategoryApprovalSettingsByTenantId(tenant.id);
  const currentStepCategoryById = new Map(
    currentSettings.flatMap((category) =>
      category.approval_step.map(
        (step) => [String(step.approval_step_id), String(category.category_id)] as const,
      ),
    ),
  );
  const submittedCategoryIds = new Set<string>();
  const submittedStepIds = new Set<string>();
  const submittedScopes = new Set<string>();

  for (const category of payload.categories) {
    if (submittedCategoryIds.has(category.id)) {
      throw createStatusError("A category cannot be submitted more than once.", 400);
    }
    submittedCategoryIds.add(category.id);

    const context = await getServiceDeskCategoryContext(category.id);

    if (
      !context ||
      context.tenant.id !== tenant.id ||
      context.mainCategoryId !== category.id
    ) {
      throw createStatusError(
        "Approval settings must reference a main category in the target tenant.",
        400,
      );
    }

    const access = resolveSettingsAccess(principal, {
      resource: "APPROVAL_STEP",
      tenantCompanyId: tenant.companyId,
      isOwnerTenant: tenant.isOwnerTenant,
      scope: context.scope,
    });

    if (!canManageServiceDeskSettings(access)) {
      throw createStatusError(
        "Approval settings are read-only for this category scope.",
        403,
      );
    }
    submittedScopes.add(context.scope);

    for (const step of category.approvalSteps) {
      if (
        step.id &&
        (currentStepCategoryById.get(step.id) !== category.id ||
          submittedStepIds.has(step.id))
      ) {
        throw createStatusError(
          "An approval step cannot move to another category or tenant.",
          400,
        );
      }

      if (step.id) submittedStepIds.add(step.id);
    }
  }

  return submittedScopes;
}
