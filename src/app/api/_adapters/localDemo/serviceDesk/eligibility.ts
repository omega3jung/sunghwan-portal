import { ACCESS_LEVEL } from "@/domain/auth";
import { isOwnerCompany } from "@/domain/organization";
import {
  type ApprovalAssigneeType,
  type AssigneeGroup,
  type CategoryScope,
  resolveAssignmentCompanyPolicy,
} from "@/domain/serviceDesk";
import { getAllowedAssignmentCompanyIds } from "@/lib/application/serviceDesk";
import { internalCompanyMock } from "@/mocks/domain/organization/companies";
import { employeesMock } from "@/mocks/domain/organization/employee";
import { clientDemoEmployee } from "@/mocks/domain/organization/employee/demoUser";
import { resolveDemoProfile } from "@/mocks/domain/user";

import {
  getLocalDemoCategories,
  getLocalDemoTenants,
} from "./settings/state";

export type LocalServiceDeskTenantContext = {
  id: string;
  companyId: number;
  isOwnerTenant: boolean;
  active: boolean;
};

export type ServiceDeskCategoryContext = {
  categoryId: string;
  mainCategoryId: string;
  scope: CategoryScope;
  tenant: LocalServiceDeskTenantContext;
};

export type EligibleActorPurpose = "APPROVAL" | "ASSIGNMENT";

export type EligibleEmployee = {
  id: number;
  username: string;
  name: (typeof employeesMock)[number]["e_name"];
  email: string;
  imageUrl: string | null;
  departmentId: number;
  jobFieldId: number;
  companyId: number;
  active: boolean;
};

export async function getServiceDeskCategoryContext(
  _dataScope: "LOCAL",
  categoryId: string | number,
): Promise<ServiceDeskCategoryContext | null> {
  const matches = new Map<
    string,
    { tenantId: number; mainCategoryId: string; scope: CategoryScope }
  >();

  for (const tenantTree of [
    ...getLocalDemoCategories(true),
    ...getLocalDemoCategories(false),
  ]) {
    for (const mainCategory of tenantTree.category) {
      const isMatch =
        String(mainCategory.category_id) === String(categoryId) ||
        mainCategory.sub_category.some(
          (subCategory) =>
            String(subCategory.category_id) === String(categoryId),
        );

      if (!isMatch) continue;

      const match = {
        tenantId: tenantTree.tenant_id,
        mainCategoryId: String(mainCategory.category_id),
        scope: mainCategory.category_scope,
      };

      matches.set(
        [match.tenantId, match.mainCategoryId, match.scope].join(":"),
        match,
      );
    }
  }

  if (matches.size !== 1) return null;

  const match = matches.values().next().value;
  const tenant = match
    ? getLocalDemoTenants().find(
        (item) => item.tenant_id === match.tenantId,
      )
    : null;

  if (!match || !tenant) return null;

  return {
    categoryId: String(categoryId),
    mainCategoryId: match.mainCategoryId,
    scope: match.scope,
    tenant: {
      id: String(tenant.tenant_id),
      companyId: Number(tenant.tenant_company_id),
      isOwnerTenant: isOwnerCompany(tenant.tenant_company_id),
      active: tenant.tenant_active !== false,
    },
  };
}

export async function getEligibleEmployeesForCategory({
  category,
  purpose,
  includeTenantCompany = false,
}: {
  dataScope: "LOCAL";
  category: ServiceDeskCategoryContext;
  purpose: EligibleActorPurpose;
  includeTenantCompany?: boolean;
}): Promise<EligibleEmployee[]> {
  const companyIds =
    purpose === "APPROVAL"
      ? [category.tenant.companyId]
      : getAllowedAssignmentCompanyIds({
          tenantCompanyId: category.tenant.companyId,
          ownerCompanyId: Number(internalCompanyMock.company_id),
          companyPolicy: resolveAssignmentCompanyPolicy({
            scope: category.scope,
            includeTenantCompany,
          }),
        });
  const eligibleCompanyIds = new Set(companyIds);

  return [...employeesMock, ...clientDemoEmployee]
    .filter(
      (employee) =>
        employee.e_active && eligibleCompanyIds.has(employee.e_company_id),
    )
    .map((employee) => ({
      id: employee.e_id,
      username: employee.e_username,
      name: employee.e_name,
      email: employee.e_email,
      imageUrl: employee.e_image_url,
      departmentId: employee.e_department_id,
      jobFieldId: employee.e_job_field_id,
      companyId: employee.e_company_id,
      active: employee.e_active,
    }));
}

export async function assertApprovalAssigneeEligible({
  category,
  assignee,
}: {
  dataScope: "LOCAL";
  category: ServiceDeskCategoryContext;
  assignee: ApprovalAssigneeType;
}) {
  const employees = await getEligibleEmployeesForCategory({
    dataScope: "LOCAL",
    category,
    purpose: "APPROVAL",
  });

  switch (assignee.type) {
    case "EMPLOYEE": {
      const usernames = new Set(employees.map((employee) => employee.username));
      if (
        assignee.employeeUsernames.length === 0 ||
        assignee.employeeUsernames.some((username) => !usernames.has(username))
      ) {
        throw createEligibilityError(
          "Approval employees must be active members of the category tenant company.",
        );
      }
      return;
    }
    case "DEPARTMENT":
      if (
        !employees.some(
          (employee) => String(employee.departmentId) === assignee.departmentId,
        )
      ) {
        throw createEligibilityError(
          "The approval department has no active employee in the category tenant company.",
        );
      }
      return;
    case "JOB_FIELD":
      if (
        !employees.some(
          (employee) => String(employee.jobFieldId) === assignee.jobFieldId,
        )
      ) {
        throw createEligibilityError(
          "The approval job field has no active employee in the category tenant company.",
        );
      }
      return;
    case "MANAGER": {
      const minimumPermission =
        assignee.level === 1 ? ACCESS_LEVEL.MANAGER : ACCESS_LEVEL.ADMIN;
      if (
        !employees.some(
          (employee) =>
            (resolveDemoProfile(employee.username)?.permission ?? 0) >=
            minimumPermission,
        )
      ) {
        throw createEligibilityError(
          "The approval manager cannot be resolved inside the category tenant company.",
        );
      }
    }
  }
}

export async function assertAssignmentAssigneeEligible({
  category,
  assignee,
}: {
  dataScope: "LOCAL";
  category: ServiceDeskCategoryContext;
  assignee: AssigneeGroup;
}) {
  if (category.scope !== "PORTAL" && assignee.includeTenantCompany) {
    throw createEligibilityError(
      "Tenant-company joint handling is available only for PORTAL assignment rules.",
    );
  }

  const employees = await getEligibleEmployeesForCategory({
    dataScope: "LOCAL",
    category,
    purpose: "ASSIGNMENT",
    includeTenantCompany: assignee.includeTenantCompany === true,
  });
  const employeesByUsername = new Map(
    employees.map((employee) => [employee.username, employee]),
  );
  const resolvedUsernames = new Set<string>();

  for (const username of assignee.assigneeUsernames) {
    const employee = employeesByUsername.get(username);
    if (!employee) {
      throw createEligibilityError(
        "Assignment employees must be active members of the eligible company.",
      );
    }
    resolvedUsernames.add(employee.username);
  }

  for (const jobFieldId of assignee.jobFieldIds) {
    const matches = employees.filter(
      (employee) => String(employee.jobFieldId) === jobFieldId,
    );
    if (matches.length === 0) {
      throw createEligibilityError(
        "An assignment job field has no active employee in the eligible company.",
      );
    }
    matches.forEach((employee) => resolvedUsernames.add(employee.username));
  }

  if (resolvedUsernames.size === 0) {
    throw createEligibilityError(
      "Assignment routing must resolve at least one active employee.",
    );
  }
}

function createEligibilityError(message: string) {
  return Object.assign(new Error(message), { status: 400 });
}
