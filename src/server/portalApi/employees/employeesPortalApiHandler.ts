import type { NextResponse as NextResponseType } from "next/server";
import { NextRequest, NextResponse } from "next/server";

import {
  getBooleanRuleGroupValue,
  getStringRuleGroupValue,
  parseRuleGroupFilter,
} from "@/lib/application/api/query";
import {
  canManageServiceDeskSettings,
  canReadServiceDeskSettings,
  resolveSettingsAccess,
} from "@/lib/application/serviceDesk";
import {
  type EligibleActorPurpose,
  getEligibleEmployeesForCategory,
  getEmployees,
} from "@/server/data/organization/employees";
import { getCategoryApprovalSettingsByTenantId } from "@/server/data/serviceDesk/approvalStep";
import { getAssignmentRulesByTenantId } from "@/server/data/serviceDesk/assignmentRule";
import { getServiceDeskCategoryContext } from "@/server/data/serviceDesk/category";
import { toApiErrorResponse } from "@/server/portalApi/http";
import {
  requireServiceDeskSettingsAdmin,
  resolveApiErrorMessage,
} from "@/server/portalApi/serviceDesk/shared";

import type { PortalApiJsonOptions } from "../types";
import { getPortalApiQueryValue, normalizePath } from "../utils";

const EMPLOYEES_PATH_PATTERN = /^\/employees(?:\/([^/]+))?$/;

export function isServiceDeskEligibleEmployeeRequest(
  request: NextRequest,
  options: Pick<PortalApiJsonOptions, "query"> = {},
) {
  const query = resolveServiceDeskEligibleEmployeeQuery(request, options);

  return query.categoryId !== null || query.purpose !== null;
}

export async function handleEmployeesPortalApi(
  request: NextRequest,
  options: PortalApiJsonOptions,
) {
  const path = normalizePath(options.path);
  const employeesMatch = EMPLOYEES_PATH_PATTERN.exec(path);

  const method = options.method ?? "GET";

  try {
    // api/employees/left-menu.
    if (employeesMatch) {
      if (isServiceDeskEligibleEmployeeRequest(request, options)) {
        return await createServiceDeskEligibleEmployeesResponse(
          request,
          options,
        );
      }

      // REST api GET.
      if (method === "GET") {
        const employees = await getEmployees(true);

        return NextResponse.json({ data: employees });
      }
    }
    // path not found.
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  } catch (error) {
    return toApiErrorResponse(error, {
      fallbackMessage: options.errorMessage,
    });
  }
}

export async function handleServiceDeskEligibleEmployeesPortalApi(
  request: NextRequest,
  options: Pick<PortalApiJsonOptions, "query" | "errorMessage"> = {
    errorMessage: resolveApiErrorMessage("serviceDesk.eligibleActors.fetch"),
  },
): Promise<NextResponseType> {
  try {
    return await createServiceDeskEligibleEmployeesResponse(request, options);
  } catch (error) {
    return toApiErrorResponse(error, {
      fallbackMessage: options.errorMessage,
    });
  }
}

async function createServiceDeskEligibleEmployeesResponse(
  request: NextRequest,
  options: Pick<PortalApiJsonOptions, "query">,
) {
  const {
    categoryId,
    purpose,
    includeTenantCompany: requestedIncludeTenantCompany,
  } = resolveServiceDeskEligibleEmployeeQuery(request, options);

  if (!categoryId || !purpose) {
    return NextResponse.json(
      { message: "A categoryId and valid purpose are required." },
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
    return NextResponse.json(
      { message: "Category not found." },
      { status: 404 },
    );
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
    return NextResponse.json(
      {
        message:
          "The requested employee information is outside this administrator scope.",
      },
      { status: 403 },
    );
  }

  const canManage = canManageServiceDeskSettings(access);
  const references = canManage
    ? null
    : await getConfiguredEmployeeReferences({
        tenantId: category.tenant.id,
        categoryId,
        mainCategoryId: category.mainCategoryId,
        purpose,
      });
  const includeTenantCompany = canManage
    ? requestedIncludeTenantCompany
    : (references?.includeTenantCompany ?? false);

  if (
    includeTenantCompany &&
    (purpose !== "ASSIGNMENT" || category.scope !== "PORTAL")
  ) {
    return NextResponse.json(
      {
        message:
          "Tenant-company joint handling is only available for PORTAL assignment rules.",
      },
      { status: 400 },
    );
  }

  const eligibleEmployees = await getEligibleEmployeesForCategory({
    dataScope: authorization.dataScope,
    category,
    purpose,
    includeTenantCompany,
  });
  const responseEmployees = references
    ? eligibleEmployees.filter((employee) =>
        references.employeeUsernames.has(employee.username),
      )
    : eligibleEmployees;

  return NextResponse.json({
    data: responseEmployees.map((employee) => ({
      id: employee.id,
      username: employee.username,
      name: employee.name,
      phone: "",
      email: employee.email,
      imageUrl: employee.imageUrl ?? undefined,
      departmentId: String(employee.departmentId),
      jobFieldId: String(employee.jobFieldId),
      companyId: String(employee.companyId),
      startDate: new Date(0),
      active: employee.active,
    })),
  });
}

type ConfiguredEmployeeReferences = {
  employeeUsernames: Set<string>;
  includeTenantCompany: boolean;
};

async function getConfiguredEmployeeReferences({
  tenantId,
  categoryId,
  mainCategoryId,
  purpose,
}: {
  tenantId: string;
  categoryId: string;
  mainCategoryId: string;
  purpose: EligibleActorPurpose;
}): Promise<ConfiguredEmployeeReferences> {
  const references: ConfiguredEmployeeReferences = {
    employeeUsernames: new Set<string>(),
    includeTenantCompany: false,
  };

  if (purpose === "APPROVAL") {
    const categories = await getCategoryApprovalSettingsByTenantId(tenantId);
    const category = categories.find(
      (item) => String(item.category_id) === categoryId,
    );

    for (const step of category?.approval_step ?? []) {
      const assignee = step.approval_step_assignee;

      if (assignee.type === "EMPLOYEE") {
        for (const username of assignee.employee_username) {
          references.employeeUsernames.add(String(username));
        }
      }
    }

    return references;
  }

  const rules = await getAssignmentRulesByTenantId(tenantId);
  const rule =
    rules.find((item) => String(item.category_id) === categoryId) ??
    rules.find((item) => String(item.category_id) === mainCategoryId);

  references.includeTenantCompany =
    rule?.assignee.include_tenant_company === true;

  for (const username of rule?.assignee.employee_username ?? []) {
    references.employeeUsernames.add(String(username));
  }

  return references;
}

function parseEligibleActorPurpose(
  value: string | null,
): EligibleActorPurpose | null {
  return value === "APPROVAL" || value === "ASSIGNMENT" ? value : null;
}

function resolveServiceDeskEligibleEmployeeQuery(
  request: NextRequest,
  options: Pick<PortalApiJsonOptions, "query">,
) {
  const filter = parseRuleGroupFilter(
    getPortalApiQueryValue(request, options, "filter"),
  );
  const categoryId = (
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
