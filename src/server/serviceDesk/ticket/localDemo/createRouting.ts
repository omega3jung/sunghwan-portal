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
const CREATE_TICKET_APPROVAL_PENDING_STATUS: TicketStatus = "Pending";
const INTERNAL_COMPANY_ID = 1;
const CLIENT_COMPANY_ID = 11;

type CreateTicketRouting = {
  status: TicketStatus;
  approvalStepId: string | null;
  assigneeIds: string[];
};

type RoutingCategoryReference = {
  categoryId: string;
  parentCategoryId: string;
};

export function resolveCreateTicketRouting({
  isInternal,
  categoryId,
  parentCategoryId,
  requesterId,
}: {
  isInternal: boolean;
  categoryId: string;
  parentCategoryId: string;
  requesterId: string;
}): CreateTicketRouting {
  const employees = createEmployeesMock();
  const requesterAccessLevel = resolveRequesterAccessLevel({
    isInternal,
    requesterId,
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
    const assigneeIds = resolveApprovalStepAssignees({
      approvalStep: nextApprovalStep,
      isInternal,
      requesterId,
      employees,
    });

    return {
      status: CREATE_TICKET_APPROVAL_PENDING_STATUS,
      approvalStepId: String(nextApprovalStep.approval_step_id),
      assigneeIds,
    };
  }

  return {
    status: "Open",
    approvalStepId: null,
    assigneeIds: resolveAssignmentAssignees({
      isInternal,
      categoryReference,
      requesterId,
      employees,
    }),
  };
}

function resolveRequesterAccessLevel({
  isInternal,
  requesterId,
  employees,
}: {
  isInternal: boolean;
  requesterId: string;
  employees: DbEmployee[];
}): AccessLevel {
  const directAuth = isInternal
    ? resolveInternalAuth(requesterId)
    : resolveClientAuth(requesterId);

  if (directAuth) {
    return directAuth.permission;
  }

  const requesterEmployee = resolveEmployeeByIdentifier(employees, requesterId);

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
    .filter((approvalStep) => approvalStep.approval_step_active !== false)
    .slice()
    .sort(
      (left, right) => left.approval_step_index - right.approval_step_index,
    );
}

function resolveNextApprovalStep({
  approvalSteps,
  requesterAccessLevel,
}: {
  approvalSteps: DbCategoryApprovalSettings["approval_step"];
  requesterAccessLevel: AccessLevel;
}) {
  return (
    approvalSteps.find((approvalStep) => {
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
  requesterId,
  employees,
}: {
  approvalStep: DbCategoryApprovalSettings["approval_step"][number];
  isInternal: boolean;
  requesterId: string;
  employees: DbEmployee[];
}) {
  const scopedEmployees = resolveScopedEmployees({
    isInternal,
    requesterId,
    employees,
  });
  const assignee = approvalStep.approval_step_assignee;

  switch (assignee.type) {
    case "EMPLOYEE":
      return normalizeAssigneeIds(
        assignee.employee_id.map((employeeId) =>
          resolveEmployeeIdentifier(scopedEmployees, String(employeeId)),
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
  requesterId,
  employees,
}: {
  isInternal: boolean;
  categoryReference: RoutingCategoryReference;
  requesterId: string;
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
    requesterId,
    employees,
  });
  const directAssignees = assignmentRule.assignee.employee_id.map(
    (employeeId) =>
      resolveEmployeeIdentifier(scopedEmployees, String(employeeId)),
  );
  const jobFieldAssignees = assignmentRule.assignee.job_field_id.flatMap(
    (jobFieldId) =>
      scopedEmployees
        .filter((employee) => employee.e_job_field_id === jobFieldId)
        .map((employee) => employee.e_username),
  );

  return normalizeAssigneeIds([...directAssignees, ...jobFieldAssignees]);
}

function normalizeAssigneeIds(assigneeIds: Array<string | null | undefined>) {
  const normalized: string[] = [];
  const seen = new Set<string>();

  for (const assigneeId of assigneeIds) {
    if (typeof assigneeId !== "string") {
      continue;
    }

    const normalizedAssigneeId = assigneeId.trim();

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
  requesterId,
  employees,
}: {
  isInternal: boolean;
  requesterId: string;
  employees: DbEmployee[];
}) {
  const requesterEmployee = resolveEmployeeByIdentifier(employees, requesterId);
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
