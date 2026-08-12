import { ACCESS_LEVEL } from "@/domain/auth";
import { isOwnerCompany } from "@/domain/organization";
import {
  type ApprovalAssigneeType,
  type AssigneeGroup,
  type CategoryScope,
  isCategoryEffectivelyActive,
} from "@/domain/serviceDesk";
import { employeesMock } from "@/mocks/domain/organization/employee";
import { clientDemoEmployee } from "@/mocks/domain/organization/employee/demoUser";
import { allJobFieldsMock } from "@/mocks/domain/organization/jobFields";
import { resolveDemoProfile } from "@/mocks/domain/user";

import {
  getLocalDemoCategories,
  getLocalDemoTenants,
} from "./settings/state";

/** Describes local service desk tenant context used by the server-side LOCAL demo runtime. */
export type LocalServiceDeskTenantContext = {
  id: string;
  companyId: number;
  isOwnerTenant: boolean;
  active: boolean;
};

/** Describes service desk category context used by the server-side LOCAL demo runtime. */
export type ServiceDeskCategoryContext = {
  categoryId: string;
  mainCategoryId: string;
  scope: CategoryScope;
  active: boolean;
  tenant: LocalServiceDeskTenantContext;
};

/** Describes local company employee used by the server-side LOCAL demo runtime. */
export type LocalCompanyEmployee = {
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

/** Returns service desk category context from the server-side LOCAL demo runtime. */
export async function getServiceDeskCategoryContext(
  categoryId: string | number,
): Promise<ServiceDeskCategoryContext | null> {
  // Category IDs in fixtures are not accepted as globally authoritative. The
  // enclosing tenant/main-category/scope relationship must resolve uniquely.
  const matches = new Map<
    string,
    {
      tenantId: number;
      mainCategoryId: string;
      scope: CategoryScope;
      active: boolean;
    }
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
        active: isCategoryEffectivelyActive(
          { active: mainCategory.category_active },
          String(mainCategory.category_id) === String(categoryId)
            ? undefined
            : {
                active:
                  mainCategory.sub_category.find(
                    (subCategory) =>
                      String(subCategory.category_id) === String(categoryId),
                  )?.category_active ?? false,
              },
        ),
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
    active: match.active,
    tenant: {
      id: String(tenant.tenant_id),
      companyId: Number(tenant.tenant_company_id),
      isOwnerTenant: isOwnerCompany(tenant.tenant_company_id),
      active: tenant.tenant_active !== false,
    },
  };
}

/** Returns active local employees by company ID from the server-side LOCAL demo runtime. */
export function getActiveLocalEmployeesByCompanyId(
  companyId: number,
): LocalCompanyEmployee[] {
  return [...employeesMock, ...clientDemoEmployee]
    .filter(
      (employee) =>
        employee.e_active && employee.e_company_id === companyId,
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

/** Enforces approval assignee eligible before LOCAL state is exposed or mutated. */
export async function assertApprovalAssigneeEligible({
  category,
  assignee,
}: {
  category: ServiceDeskCategoryContext;
  assignee: ApprovalAssigneeType;
}) {
  const employees = getActiveLocalEmployeesByCompanyId(
    category.tenant.companyId,
  );

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
        assignee.managerDistance === 1
          ? ACCESS_LEVEL.MANAGER
          : ACCESS_LEVEL.ADMIN;
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

/** Enforces assignment assignee eligible before LOCAL state is exposed or mutated. */
export async function assertAssignmentAssigneeEligible({
  category,
  assignee,
}: {
  category: ServiceDeskCategoryContext;
  assignee: AssigneeGroup;
}) {
  // LOCAL validates against active tenant-company employees to preserve the
  // same reference boundary enforced by REMOTE repository validation queries.
  if (category.scope !== "PORTAL" && assignee.includeTenantCompany) {
    throw createEligibilityError(
      "Tenant-company joint handling is available only for PORTAL assignment rules.",
    );
  }

  const employees = getActiveLocalEmployeesByCompanyId(
    category.tenant.companyId,
  );
  const employeesByUsername = new Map(
    employees.map((employee) => [employee.username, employee]),
  );
  for (const username of assignee.assigneeUsernames) {
    const employee = employeesByUsername.get(username);
    if (!employee) {
      throw createEligibilityError(
        "Assignment employees must be active members of the eligible company.",
      );
    }
  }

  for (const jobFieldId of assignee.jobFieldIds) {
    const jobField = allJobFieldsMock.find(
      (item) =>
        String(item.jf_id) === jobFieldId &&
        item.jf_company_id === category.tenant.companyId &&
        item.jf_active,
    );
    if (!jobField) {
      throw createEligibilityError(
        "Assignment job fields must be active references in the eligible company.",
      );
    }
  }
}

function createEligibilityError(message: string) {
  return Object.assign(new Error(message), { status: 400 });
}
