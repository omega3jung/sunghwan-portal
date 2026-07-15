import type { NextResponse as NextResponseType } from "next/server";
import { NextRequest, NextResponse } from "next/server";

import { toApiErrorResponse } from "@/app/api/_helpers";
import {
  requireServiceDeskSettingsAdmin,
  tServiceDeskApi,
} from "@/app/api/service-desk/_shared";
import { camelDepartmentMapper } from "@/feature/organization/department";
import { camelJobFieldMapper } from "@/feature/organization/jobField";
import { allDepartmentsMock } from "@/mocks/domain/organization/departments";
import { allJobFieldsMock } from "@/mocks/domain/organization/jobFields";
import { getActiveDepartments } from "@/server/data/organization/department";
import {
  type EligibleActorPurpose,
  getEligibleEmployeesForCategory,
} from "@/server/data/organization/employees";
import { getActiveJobFields } from "@/server/data/organization/jobField";
import { getServiceDeskCategoryContext } from "@/server/data/serviceDesk/category";
import {
  getBooleanRuleGroupValue,
  getStringRuleGroupValue,
  parseRuleGroupFilter,
} from "@/server/shared/query";
import {
  canReadServiceDeskSettings,
  resolveSettingsAccess,
} from "@/shared/utils/serviceDesk";

import type { PortalApiJsonOptions } from "../types";
import { getPortalApiQueryValue } from "../utils";

export function isServiceDeskOrganizationReferenceRequest(
  request: NextRequest,
  options: Pick<PortalApiJsonOptions, "query"> = {},
) {
  const query = resolveServiceDeskReferenceQuery(request, options);

  return query.categoryId !== null || query.purpose !== null;
}

export async function handleServiceDeskDepartmentReferenceRequest(
  request: NextRequest,
  options: Pick<PortalApiJsonOptions, "query" | "errorMessage"> = {
    errorMessage: tServiceDeskApi("api.eligibleActors.fetch"),
  },
): Promise<NextResponseType> {
  try {
    const { eligibleDepartmentIds, dataScope } =
      await resolveEligibleOrganizationReference(request, options);
    const source =
      dataScope === "LOCAL" ? allDepartmentsMock : await getActiveDepartments();
    const items = camelDepartmentMapper(
      source.filter((department) =>
        eligibleDepartmentIds.has(String(department.d_id)),
      ),
    );

    return NextResponse.json({
      items,
      total: items.length,
    });
  } catch (error) {
    return toApiErrorResponse(error, {
      fallbackMessage: options.errorMessage,
    });
  }
}

export async function handleServiceDeskJobFieldReferenceRequest(
  request: NextRequest,
  options: Pick<PortalApiJsonOptions, "query" | "errorMessage"> = {
    errorMessage: tServiceDeskApi("api.eligibleActors.fetch"),
  },
): Promise<NextResponseType> {
  try {
    const { eligibleJobFieldIds, dataScope } =
      await resolveEligibleOrganizationReference(request, options);
    const source =
      dataScope === "LOCAL" ? allJobFieldsMock : await getActiveJobFields();
    const items = camelJobFieldMapper(
      source.filter((jobField) =>
        eligibleJobFieldIds.has(String(jobField.jf_id)),
      ),
    );

    return NextResponse.json({
      items,
      total: items.length,
    });
  } catch (error) {
    return toApiErrorResponse(error, {
      fallbackMessage: options.errorMessage,
    });
  }
}

async function resolveEligibleOrganizationReference(
  request: NextRequest,
  options: Pick<PortalApiJsonOptions, "query">,
) {
  const { categoryId, purpose, includeTenantCompany } =
    resolveServiceDeskReferenceQuery(request, options);

  if (!categoryId || !purpose) {
    throw Object.assign(
      new Error("A categoryId and valid purpose are required."),
      { status: 400 },
    );
  }

  const authorization = await requireServiceDeskSettingsAdmin(request);
  const category = await getServiceDeskCategoryContext(
    authorization.dataScope,
    categoryId,
  );

  if (
    !category ||
    (purpose === "APPROVAL" && category.mainCategoryId !== categoryId)
  ) {
    throw Object.assign(new Error("Category not found."), { status: 404 });
  }

  const resource =
    purpose === "APPROVAL" ? "APPROVAL_STEP" : "ASSIGNMENT_RULE";
  const access = resolveSettingsAccess(authorization.principal, {
    resource,
    tenantCompanyId: category.tenant.companyId,
    isOwnerTenant: category.tenant.isOwnerTenant,
    scope: category.scope,
  });

  if (!canReadServiceDeskSettings(access)) {
    throw Object.assign(
      new Error(
        "The requested organization information is outside this administrator scope.",
      ),
      { status: 403 },
    );
  }

  if (
    includeTenantCompany &&
    (purpose !== "ASSIGNMENT" || category.scope !== "PORTAL")
  ) {
    throw Object.assign(
      new Error(
        "Tenant-company joint handling is only available for PORTAL assignment rules.",
      ),
      { status: 400 },
    );
  }

  const employees = await getEligibleEmployeesForCategory({
    dataScope: authorization.dataScope,
    category,
    purpose,
    includeTenantCompany,
  });

  return {
    dataScope: authorization.dataScope,
    eligibleDepartmentIds: new Set(
      employees.map((employee) => String(employee.departmentId)),
    ),
    eligibleJobFieldIds: new Set(
      employees.map((employee) => String(employee.jobFieldId)),
    ),
  };
}

function parseEligibleActorPurpose(
  value: string | null,
): EligibleActorPurpose | null {
  return value === "APPROVAL" || value === "ASSIGNMENT" ? value : null;
}

function resolveServiceDeskReferenceQuery(
  request: NextRequest,
  options: Pick<PortalApiJsonOptions, "query">,
) {
  const filter = parseRuleGroupFilter(
    getPortalApiQueryValue(request, options, "filter"),
  );
  const categoryId =
    (
      getPortalApiQueryValue(request, options, "categoryId") ??
      getStringRuleGroupValue(filter, "categoryId")
    )?.trim() ?? null;
  const purpose = parseEligibleActorPurpose(
    getPortalApiQueryValue(request, options, "purpose") ??
      getStringRuleGroupValue(filter, "purpose"),
  );
  const includeTenantCompany =
    getPortalApiQueryValue(request, options, "includeTenantCompany") ===
      "true" ||
    getBooleanRuleGroupValue(filter, "includeTenantCompany") === true;

  return {
    categoryId,
    purpose,
    includeTenantCompany,
  };
}
