import { ACCESS_LEVEL, type DataScope } from "@/domain/auth";
import {
  type ApprovalAssigneeType,
  type AssigneeGroup,
  resolveAssignmentCompanyPolicy,
} from "@/domain/serviceDesk";
import { getAllowedAssignmentCompanyIds } from "@/lib/application/serviceDesk";
import { employeesMock } from "@/mocks/domain/organization/employee";
import { clientDemoEmployee } from "@/mocks/domain/organization/employee/demoUser";
import { resolveDemoProfile } from "@/mocks/domain/user";
import { type ServiceDeskCategoryContext } from "@/server/data/serviceDesk/category";
import { getPortalOwnerCompanyId } from "@/server/data/serviceDesk/tenant";
import { getUserProfileDtoByUsername } from "@/server/data/users/userService";

import { EmployeeResponseDto } from "./employeesDto";
import { toEmployeesResponseDto } from "./employeesMapper";
import { findEmployees } from "./employeesRepository";

export async function getEmployees(
  active: boolean,
): Promise<EmployeeResponseDto[]> {
  const employee = await findEmployees(active);

  return toEmployeesResponseDto(employee);
}

export type EligibleActorPurpose = "APPROVAL" | "ASSIGNMENT";

export type EligibleEmployee = {
  id: number;
  username: string;
  name: EmployeeResponseDto["name"];
  email: string;
  imageUrl: string | null;
  departmentId: number;
  jobFieldId: number;
  companyId: number;
  active: boolean;
};

export async function getEligibleEmployeesForCategory({
  dataScope,
  category,
  purpose,
  includeTenantCompany = false,
}: {
  dataScope: DataScope;
  category: ServiceDeskCategoryContext;
  purpose: EligibleActorPurpose;
  includeTenantCompany?: boolean;
}) {
  const companyIds = await resolveEligibleActorCompanyIds({
    dataScope,
    category,
    purpose,
    includeTenantCompany,
  });
  const eligibleCompanyIds = new Set(companyIds);
  const employees = await getActiveEmployeeEligibilityRecords(dataScope);

  return employees.filter((employee) =>
    eligibleCompanyIds.has(employee.companyId),
  );
}

export async function assertApprovalAssigneeEligible({
  dataScope,
  category,
  assignee,
}: {
  dataScope: DataScope;
  category: ServiceDeskCategoryContext;
  assignee: ApprovalAssigneeType;
}) {
  const employees = await getEligibleEmployeesForCategory({
    dataScope,
    category,
    purpose: "APPROVAL",
  });

  switch (assignee.type) {
    case "EMPLOYEE": {
      const eligibleUsernames = new Set(
        employees.map((employee) => employee.username),
      );

      if (
        assignee.employeeUsernames.length === 0 ||
        assignee.employeeUsernames.some(
          (username) => !eligibleUsernames.has(username),
        )
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
      const profiles = await Promise.all(
        employees.map((employee) =>
          resolveEmployeeProfile(dataScope, employee.username),
        ),
      );

      if (
        !profiles.some(
          (profile) => profile && profile.permission >= minimumPermission,
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
  dataScope,
  category,
  assignee,
}: {
  dataScope: DataScope;
  category: ServiceDeskCategoryContext;
  assignee: AssigneeGroup;
}) {
  if (category.scope !== "PORTAL" && assignee.includeTenantCompany) {
    throw createEligibilityError(
      "Tenant-company joint handling is available only for PORTAL assignment rules.",
    );
  }

  const employees = await getEligibleEmployeesForCategory({
    dataScope,
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

    for (const employee of matches) {
      resolvedUsernames.add(employee.username);
    }
  }

  if (resolvedUsernames.size === 0) {
    throw createEligibilityError(
      "Assignment routing must resolve at least one active employee.",
    );
  }
}

export async function resolveEligibleActorCompanyIds({
  dataScope,
  category,
  purpose,
  includeTenantCompany = false,
}: {
  dataScope: DataScope;
  category: ServiceDeskCategoryContext;
  purpose: EligibleActorPurpose;
  includeTenantCompany?: boolean;
}) {
  if (purpose === "APPROVAL") {
    return [category.tenant.companyId];
  }

  const ownerCompanyId = await getPortalOwnerCompanyId(dataScope);
  const companyPolicy = resolveAssignmentCompanyPolicy({
    scope: category.scope,
    includeTenantCompany,
  });

  return getAllowedAssignmentCompanyIds({
    tenantCompanyId: category.tenant.companyId,
    ownerCompanyId,
    companyPolicy,
  });
}

async function getActiveEmployeeEligibilityRecords(
  dataScope: DataScope,
): Promise<EligibleEmployee[]> {
  if (dataScope === "LOCAL") {
    return [...employeesMock, ...clientDemoEmployee]
      .filter((employee) => employee.e_active)
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

  return (await getEmployees(true)).map((employee) => ({
    id: employee.employeeId,
    username: employee.username,
    name: employee.name,
    email: employee.email,
    imageUrl: employee.imageUrl,
    departmentId: employee.departmentId,
    jobFieldId: employee.jobFieldId,
    companyId: employee.companyId,
    active: employee.active,
  }));
}

async function resolveEmployeeProfile(dataScope: DataScope, username: string) {
  return dataScope === "LOCAL"
    ? resolveDemoProfile(username)
    : getUserProfileDtoByUsername(username);
}

function createEligibilityError(message: string) {
  return Object.assign(new Error(message), { status: 400 });
}
