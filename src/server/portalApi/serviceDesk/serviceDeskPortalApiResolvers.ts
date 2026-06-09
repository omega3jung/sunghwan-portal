import { ServiceDeskApiError } from "@/app/api/service-desk/_shared/messages";
import { findApprovalStepRowsByTenantIdAndApprovalStepId } from "@/server/data/serviceDesk/approvalStep";
import type { AssignmentRuleDto } from "@/server/data/serviceDesk/assignmentRule";
import { getAssignmentRuleByCategoryId } from "@/server/data/serviceDesk/assignmentRule";
import { findCategoryRowsByTenantIdAndCategoryId } from "@/server/data/serviceDesk/category";

import { getPortalApiQueryValue } from "../utils";
import {
  createStatusError,
  parseNumberValue,
  resolveAccessibleTenantIds,
  ServiceDeskPortalApiContext,
} from "./serviceDeskPortalApiShared";

export async function resolveCreateCategoryTenantId(
  context: ServiceDeskPortalApiContext,
) {
  const tenantId = parseNumberValue(
    getPortalApiQueryValue(context.request, context.options, "tenantId"),
  );

  if (tenantId !== null) {
    return tenantId;
  }

  const accessibleTenantIds = await resolveAccessibleTenantIds(context);

  if (accessibleTenantIds.length === 1) {
    return accessibleTenantIds[0];
  }

  throw createStatusError("tenantId is required.", 400);
}

export async function resolveTenantIdByCategoryId(
  context: ServiceDeskPortalApiContext,
  categoryId: string | number,
) {
  for (const tenantId of await resolveAccessibleTenantIds(context)) {
    const rows = await findCategoryRowsByTenantIdAndCategoryId(
      tenantId,
      categoryId,
    );
    const targetRow = rows.find(
      (row) => Number(row.cat_id) === Number(categoryId),
    );

    if (targetRow) {
      return tenantId;
    }
  }

  throw new ServiceDeskApiError("api.common.notFound", 404);
}

export async function resolveTenantIdByApprovalStepId(
  context: ServiceDeskPortalApiContext,
  approvalStepId: string | number,
) {
  for (const tenantId of await resolveAccessibleTenantIds(context)) {
    const rows = await findApprovalStepRowsByTenantIdAndApprovalStepId(
      tenantId,
      approvalStepId,
    );

    if (rows.length > 0) {
      return tenantId;
    }
  }

  throw new ServiceDeskApiError("api.common.notFound", 404);
}

export async function resolveAssignmentRuleTargetByCategoryId(
  context: ServiceDeskPortalApiContext,
  categoryId: string | number,
): Promise<{
  tenantId: number;
  assignmentRule: AssignmentRuleDto;
}> {
  for (const tenantId of await resolveAccessibleTenantIds(context)) {
    const assignmentRule = await getAssignmentRuleByCategoryId({
      categoryId,
      tenantId,
      isInternal: true,
    });

    if (assignmentRule) {
      return {
        tenantId,
        assignmentRule,
      };
    }
  }

  throw new ServiceDeskApiError("api.common.notFound", 404);
}
