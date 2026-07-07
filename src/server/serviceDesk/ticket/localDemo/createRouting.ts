import { ACCESS_LEVEL, AccessLevel } from "@/domain/auth";
import { TicketStatus } from "@/domain/serviceDesk";
import { DbEmployee } from "@/feature/organization/employee";
import { DbCategoryApprovalSettings } from "@/feature/serviceDesk/approvalStep";
import { createEmployeesMock } from "@/mocks/domain/organization/employee";
import {
  clientAuths,
  internalAuths,
  resolveClientAuth,
  resolveInternalAuth,
} from "@/mocks/domain/user";
import {
  getLocalDemoApprovalSteps,
  getLocalDemoAssignmentRules,
} from "@/server/serviceDesk/settings/state";

const DEFAULT_REQUESTER_ACCESS_LEVEL = ACCESS_LEVEL.USER;
const CREATE_TICKET_APPROVAL_STATUS: TicketStatus = "Approval";
const CREATE_TICKET_ASSIGNED_STATUS: TicketStatus = "Assigned";
const INTERNAL_COMPANY_ID = 1;
const CLIENT_COMPANY_ID = 11;

type CreateTicketRouting = {
  status: TicketStatus;
  approvalStepId: string | null;
  assigneeUsernames: string[];
};

type RoutingCategoryReference = {
  categoryId: string;
  parentCategoryId: string;
};

export function resolveCreateTicketRouting({
  isInternal,
  categoryId,
  parentCategoryId,
  requesterUsername,
}: {
  isInternal: boolean;
  categoryId: string;
  parentCategoryId: string;
  requesterUsername: string;
}): CreateTicketRouting {
  const employees = createEmployeesMock();
  const requesterAccessLevel = resolveRequesterAccessLevel({
    isInternal,
    requesterUsername,
    employees,
  });
  const categoryReference: RoutingCategoryReference = {
    categoryId,
    parentCategoryId,
  };
  const approvalSteps = resolveCategoryApprovalSteps({
    isInternal,
    categoryReference,
  });
  const nextApprovalStep = resolveNextApprovalStep({
    approvalSteps,
    requesterAccessLevel,
  });

  if (nextApprovalStep) {
    const assigneeUsernames = resolveApprovalStepAssignees({
      approvalStep: nextApprovalStep,
      isInternal,
      requesterUsername,
      employees,
    });

    return {
      status: CREATE_TICKET_APPROVAL_STATUS,
      approvalStepId: String(nextApprovalStep.approval_step_id),
      assigneeUsernames,
    };
  }

  return {
    status: CREATE_TICKET_ASSIGNED_STATUS,
    approvalStepId: null,
    assigneeUsernames: resolveAssignmentAssignees({
      isInternal,
      categoryReference,
      requesterUsername,
      employees,
    }),
  };
}

export function resolveApprovedTicketRouting({
  isInternal,
  categoryId,
  parentCategoryId,
  requesterUsername,
  currentApprovalStepId,
}: {
  isInternal: boolean;
  categoryId: string;
  parentCategoryId: string;
  requesterUsername: string;
  currentApprovalStepId: string;
}): CreateTicketRouting {
  const employees = createEmployeesMock();
  const requesterAccessLevel = resolveRequesterAccessLevel({
    isInternal,
    requesterUsername,
    employees,
  });
  const categoryReference: RoutingCategoryReference = {
    categoryId,
    parentCategoryId,
  };
  const approvalSteps = resolveCategoryApprovalSteps({
    isInternal,
    categoryReference,
  });
  const nextApprovalStep = resolveNextApprovalStep({
    approvalSteps,
    requesterAccessLevel,
    currentApprovalStepId,
  });

  if (nextApprovalStep) {
    const assigneeUsernames = resolveApprovalStepAssignees({
      approvalStep: nextApprovalStep,
      isInternal,
      requesterUsername,
      employees,
    });

    return {
      status: CREATE_TICKET_APPROVAL_STATUS,
      approvalStepId: String(nextApprovalStep.approval_step_id),
      assigneeUsernames,
    };
  }

  return {
    status: CREATE_TICKET_ASSIGNED_STATUS,
    approvalStepId: null,
    assigneeUsernames: resolveAssignmentAssignees({
      isInternal,
      categoryReference,
      requesterUsername,
      employees,
    }),
  };
}

function resolveRequesterAccessLevel({
  isInternal,
  requesterUsername,
  employees,
}: {
  isInternal: boolean;
  requesterUsername: string;
  employees: DbEmployee[];
}): AccessLevel {
  const directAuth = isInternal
    ? resolveInternalAuth(requesterUsername)
    : resolveClientAuth(requesterUsername);

  if (directAuth) {
    return directAuth.permission;
  }

  const requesterEmployee = resolveEmployeeByIdentifier(
    employees,
    requesterUsername,
  );

  if (!requesterEmployee) {
    return DEFAULT_REQUESTER_ACCESS_LEVEL;
  }

  const employeeKeyCandidates = [
    requesterEmployee.e_username,
    String(requesterEmployee.e_id),
  ];

  for (const employeeKey of employeeKeyCandidates) {
    const auth = isInternal
      ? resolveInternalAuth(employeeKey)
      : resolveClientAuth(employeeKey);

    if (auth) {
      return auth.permission;
    }
  }

  return DEFAULT_REQUESTER_ACCESS_LEVEL;
}

function resolveCategoryApprovalSteps({
  isInternal,
  categoryReference,
}: {
  isInternal: boolean;
  categoryReference: RoutingCategoryReference;
}) {
  const categories = getLocalDemoApprovalSteps(isInternal);
  const targetCategory = findByCategoryIdWithParentFallback(
    categories,
    categoryReference,
  );

  if (!targetCategory) {
    return [];
  }

  return targetCategory.approval_step
    .slice()
    .sort(
      (left, right) => left.approval_step_index - right.approval_step_index,
    );
}

function resolveNextApprovalStep({
  approvalSteps,
  requesterAccessLevel,
  currentApprovalStepId = null,
}: {
  approvalSteps: DbCategoryApprovalSettings["approval_step"];
  requesterAccessLevel: AccessLevel;
  currentApprovalStepId?: string | number | null;
}) {
  const currentApprovalStep = approvalSteps.find(
    (approvalStep) =>
      String(approvalStep.approval_step_id) ===
      String(currentApprovalStepId ?? ""),
  );
  const currentApprovalStepIndex =
    currentApprovalStep?.approval_step_index ?? -1;

  return (
    approvalSteps.find((approvalStep) => {
      if (approvalStep.approval_step_index <= currentApprovalStepIndex) {
        return false;
      }

      if (approvalStep.skip_access_level === null) {
        return true;
      }

      return requesterAccessLevel < approvalStep.skip_access_level;
    }) ?? null
  );
}

function resolveApprovalStepAssignees({
  approvalStep,
  isInternal,
  requesterUsername,
  employees,
}: {
  approvalStep: DbCategoryApprovalSettings["approval_step"][number];
  isInternal: boolean;
  requesterUsername: string;
  employees: DbEmployee[];
}) {
  const scopedEmployees = resolveScopedEmployees({
    isInternal,
    requesterUsername,
    employees,
  });
  const assignee = approvalStep.approval_step_assignee;

  switch (assignee.type) {
    case "EMPLOYEE":
      return normalizeAssigneeIds(
        assignee.employee_username.map((employeeUsername) =>
          resolveEmployeeIdentifier(scopedEmployees, String(employeeUsername)),
        ),
      );
    case "JOB_FIELD":
      if (!("field_id" in assignee)) {
        return [];
      }
      return normalizeAssigneeIds(
        scopedEmployees
          .filter((employee) => employee.e_job_field_id === assignee.field_id)
          .map((employee) => employee.e_username),
      );
    case "DEPARTMENT":
      if (!("department_id" in assignee)) {
        return [];
      }
      return normalizeAssigneeIds(
        scopedEmployees
          .filter(
            (employee) => employee.e_department_id === assignee.department_id,
          )
          .map((employee) => employee.e_username),
      );
    case "MANAGER":
      if (!("level" in assignee)) {
        return [];
      }
      return normalizeAssigneeIds(
        resolveManagerAssigneeIds({
          isInternal,
          scopedEmployees,
          level: assignee.level,
        }),
      );
  }
}

function resolveAssignmentAssignees({
  isInternal,
  categoryReference,
  requesterUsername,
  employees,
}: {
  isInternal: boolean;
  categoryReference: RoutingCategoryReference;
  requesterUsername: string;
  employees: DbEmployee[];
}) {
  const assignmentRule = findByCategoryIdWithParentFallback(
    getLocalDemoAssignmentRules(isInternal),
    categoryReference,
  );

  if (!assignmentRule) {
    return [];
  }

  const scopedEmployees = resolveScopedEmployees({
    isInternal,
    requesterUsername,
    employees,
  });
  const directAssignees = assignmentRule.assignee.employee_username.map(
    (employeeUsername) =>
      resolveEmployeeIdentifier(scopedEmployees, String(employeeUsername)),
  );
  const jobFieldAssignees = assignmentRule.assignee.job_field_id.flatMap(
    (jobFieldId) =>
      scopedEmployees
        .filter((employee) => employee.e_job_field_id === jobFieldId)
        .map((employee) => employee.e_username),
  );

  return normalizeAssigneeIds([...directAssignees, ...jobFieldAssignees]);
}

function normalizeAssigneeIds(
  assigneeUsernames: Array<string | null | undefined>,
) {
  const normalized: string[] = [];
  const seen = new Set<string>();

  for (const assigneeUsername of assigneeUsernames) {
    if (typeof assigneeUsername !== "string") {
      continue;
    }

    const normalizedAssigneeId = assigneeUsername.trim();

    if (!normalizedAssigneeId || seen.has(normalizedAssigneeId)) {
      continue;
    }

    seen.add(normalizedAssigneeId);
    normalized.push(normalizedAssigneeId);
  }

  return normalized;
}

function findByCategoryIdWithParentFallback<
  T extends {
    category_id: number;
  },
>(items: T[], categoryReference: RoutingCategoryReference): T | null {
  const categoryCandidates = [
    categoryReference.categoryId,
    categoryReference.parentCategoryId,
  ];

  for (const categoryCandidate of categoryCandidates) {
    const found = items.find(
      (item) => String(item.category_id) === categoryCandidate,
    );

    if (found) {
      return found;
    }
  }

  return null;
}

function resolveEmployeeByIdentifier(
  employees: DbEmployee[],
  identifier: string,
): DbEmployee | null {
  return (
    employees.find(
      (employee) =>
        employee.e_username === identifier ||
        String(employee.e_id) === identifier,
    ) ?? null
  );
}

function resolveEmployeeIdentifier(
  employees: DbEmployee[],
  value: string,
): string | null {
  const employee = resolveEmployeeByIdentifier(employees, value);

  return employee?.e_username ?? value;
}

function resolveScopedEmployees({
  isInternal,
  requesterUsername,
  employees,
}: {
  isInternal: boolean;
  requesterUsername: string;
  employees: DbEmployee[];
}) {
  const requesterEmployee = resolveEmployeeByIdentifier(
    employees,
    requesterUsername,
  );
  const companyId =
    requesterEmployee?.e_company_id ??
    (isInternal ? INTERNAL_COMPANY_ID : CLIENT_COMPANY_ID);
  const scopedEmployees = employees.filter(
    (employee) => employee.e_company_id === companyId && employee.e_active,
  );

  return scopedEmployees.length > 0
    ? scopedEmployees
    : employees.filter((employee) => employee.e_active);
}

function resolveManagerAssigneeIds({
  isInternal,
  scopedEmployees,
  level,
}: {
  isInternal: boolean;
  scopedEmployees: DbEmployee[];
  level: 1 | 2;
}) {
  const scopedAuths = (isInternal ? internalAuths : clientAuths).filter(
    (auth) =>
      level === 1
        ? auth.permission >= ACCESS_LEVEL.MANAGER
        : auth.permission >= ACCESS_LEVEL.ADMIN,
  );
  const scopedUserNameSet = new Set(
    scopedEmployees.map((employee) => employee.e_username),
  );
  const managerUserNames = scopedAuths
    .map((auth) => auth.username)
    .filter((username) => scopedUserNameSet.has(username));

  if (managerUserNames.length > 0) {
    return managerUserNames;
  }

  return scopedAuths.map((auth) => auth.username);
}
