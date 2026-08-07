import {
  getActiveLocalEmployeesByCompanyId,
  getServiceDeskCategoryContext,
  type LocalCompanyEmployee,
  type ServiceDeskCategoryContext,
} from "@/app/api/_adapters/localDemo/serviceDesk/eligibility";
import {
  getLocalDemoApprovalSteps,
  getLocalDemoAssignmentRules,
} from "@/app/api/_adapters/localDemo/serviceDesk/settings/state";
import { ACCESS_LEVEL, type AccessLevel } from "@/domain/auth";
import type { TicketStatus } from "@/domain/serviceDesk";
import { ApiError } from "@/lib/application/api";
import type {
  DbAssignmentRule,
  DbCategoryApprovalSettings,
} from "@/lib/application/contracts/serviceDesk";
import { resolveDemoAuth } from "@/mocks/domain/user";

const DEFAULT_REQUESTER_ACCESS_LEVEL = ACCESS_LEVEL.USER;
const CREATE_TICKET_APPROVAL_STATUS: TicketStatus = "Approval";
const CREATE_TICKET_ASSIGNED_STATUS: TicketStatus = "Assigned";

/** Describes create ticket routing used by the server-side LOCAL ticket adapter. */
export type CreateTicketRouting = {
  status: TicketStatus;
  approvalStepId: string | null;
  assigneeUsernames: string[];
};

type RoutingInput = {
  // Kept for caller compatibility. Category context, not the requester, is the
  // authority for tenant and scope during routing.
  isInternal: boolean;
  categoryId: string;
  parentCategoryId: string;
  requesterUsername: string;
};

type ApprovedRoutingInput = RoutingInput & {
  currentApprovalStepId: string;
};

/**
 * Resolves initial LOCAL approval or work routing from the selected category.
 *
 * Category relationships, not caller-supplied tenant flags, define the tenant
 * and scope boundary. Approval uses the main-category fallback; work assignment
 * checks the selected category before its main category. A route that resolves
 * no active assignee fails instead of creating an unowned workflow ticket.
 */
export async function resolveCreateTicketRouting(
  input: RoutingInput,
): Promise<CreateTicketRouting> {
  return resolveTicketRouting(input);
}

/** Resolves approved ticket routing using the server-side LOCAL ticket adapter policy. */
export async function resolveApprovedTicketRouting(
  input: ApprovedRoutingInput,
): Promise<CreateTicketRouting> {
  return resolveTicketRouting(input);
}

async function resolveTicketRouting(
  input: RoutingInput & { currentApprovalStepId?: string },
): Promise<CreateTicketRouting> {
  const category = await requireLocalCategoryContext(input.categoryId);
  const requesterAccessLevel = resolveRequesterAccessLevel(
    input.requesterUsername,
  );
  const approvalSteps = resolveCategoryApprovalSteps(category);
  const nextApprovalStep = resolveNextApprovalStep({
    approvalSteps,
    requesterAccessLevel,
    currentApprovalStepId: input.currentApprovalStepId,
  });

  if (nextApprovalStep) {
    const companyEmployees = getActiveLocalEmployeesByCompanyId(
      category.tenant.companyId,
    );
    const assigneeUsernames = resolveApprovalStepAssignees({
      approvalStep: nextApprovalStep,
      eligibleEmployees: companyEmployees,
    });

    assertRoutingResolved(assigneeUsernames, input.categoryId);

    return {
      status: CREATE_TICKET_APPROVAL_STATUS,
      approvalStepId: String(nextApprovalStep.approval_step_id),
      assigneeUsernames,
    };
  }

  const assigneeUsernames = await resolveAssignmentAssignees(category);

  assertRoutingResolved(assigneeUsernames, input.categoryId);

  return {
    status: CREATE_TICKET_ASSIGNED_STATUS,
    approvalStepId: null,
    assigneeUsernames,
  };
}

async function requireLocalCategoryContext(categoryId: string) {
  const category = await getServiceDeskCategoryContext(categoryId);

  if (!category || !category.tenant.active) {
    throw new ApiError("serviceDesk.tickets.localDemo.categoryNotFound", 404, {
      categoryId,
    });
  }

  return category;
}

function resolveRequesterAccessLevel(requesterUsername: string): AccessLevel {
  return (
    resolveDemoAuth(requesterUsername)?.permission ??
    DEFAULT_REQUESTER_ACCESS_LEVEL
  );
}

function resolveCategoryApprovalSteps(category: ServiceDeskCategoryContext) {
  const categories = getLocalDemoApprovalSteps(category.tenant.isOwnerTenant);
  const targetCategory = findByCategoryIdWithMainFallback(categories, category);

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
  // Skip thresholds mean users at or above the configured access level do not
  // require that step. Ordering is workflow order, not display-only sorting.
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
  eligibleEmployees,
}: {
  approvalStep: DbCategoryApprovalSettings["approval_step"][number];
  eligibleEmployees: LocalCompanyEmployee[];
}) {
  const assignee = approvalStep.approval_step_assignee;

  switch (assignee.type) {
    case "EMPLOYEE":
      return normalizeAssigneeIds(
        assignee.employee_username.map((employeeUsername) =>
          resolveCompanyEmployeeUsername(
            eligibleEmployees,
            String(employeeUsername),
          ),
        ),
      );
    case "JOB_FIELD":
      if (!("field_id" in assignee)) {
        return [];
      }
      return normalizeAssigneeIds(
        eligibleEmployees
          .filter((employee) => employee.jobFieldId === assignee.field_id)
          .map((employee) => employee.username),
      );
    case "DEPARTMENT":
      if (!("department_id" in assignee)) {
        return [];
      }
      return normalizeAssigneeIds(
        eligibleEmployees
          .filter(
            (employee) => employee.departmentId === assignee.department_id,
          )
          .map((employee) => employee.username),
      );
    case "MANAGER":
      if (!("level" in assignee)) {
        return [];
      }
      return normalizeAssigneeIds(
        resolveManagerAssigneeUsernames(eligibleEmployees, assignee.level),
      );
  }
}

async function resolveAssignmentAssignees(
  category: ServiceDeskCategoryContext,
) {
  const assignmentRule = findAssignmentRuleWithMainFallback(
    getLocalDemoAssignmentRules(category.tenant.isOwnerTenant),
    category,
  );

  if (!assignmentRule) {
    return [];
  }

  const eligibleEmployees = getActiveLocalEmployeesByCompanyId(
    category.tenant.companyId,
  );

  const directAssignees = assignmentRule.assignee.employee_username.map(
    (employeeUsername) =>
      resolveCompanyEmployeeUsername(
        eligibleEmployees,
        String(employeeUsername),
      ),
  );
  const jobFieldAssignees = assignmentRule.assignee.job_field_id.flatMap(
    (jobFieldId) =>
      eligibleEmployees
        .filter((employee) => employee.jobFieldId === jobFieldId)
        .map((employee) => employee.username),
  );

  return normalizeAssigneeIds([...directAssignees, ...jobFieldAssignees]);
}

function findAssignmentRuleWithMainFallback(
  rules: DbAssignmentRule[],
  category: ServiceDeskCategoryContext,
) {
  // Subcategory assignment is more specific. The main-category rule is used
  // only when the selected subcategory has no effective assignee selection.
  const categoryCandidates = [category.categoryId, category.mainCategoryId];

  for (const categoryCandidate of categoryCandidates) {
    const found = rules.find(
      (rule) =>
        String(rule.category_id) === categoryCandidate &&
        hasDbAssignmentRuleSelection(rule),
    );

    if (found) {
      return found;
    }
  }

  return null;
}

function hasDbAssignmentRuleSelection(rule: DbAssignmentRule) {
  return (
    rule.assignee.job_field_id.length > 0 ||
    rule.assignee.employee_username.length > 0
  );
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

function findByCategoryIdWithMainFallback<
  T extends {
    category_id: number;
  },
>(items: T[], category: ServiceDeskCategoryContext): T | null {
  const categoryCandidates = [category.categoryId, category.mainCategoryId];

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

function resolveCompanyEmployeeUsername(
  employees: LocalCompanyEmployee[],
  identifier: string,
): string | null {
  const employee = employees.find(
    (item) => item.username === identifier || String(item.id) === identifier,
  );

  return employee?.username ?? null;
}

function resolveManagerAssigneeUsernames(
  eligibleEmployees: LocalCompanyEmployee[],
  level: 1 | 2,
) {
  const minimumPermission =
    level === 1 ? ACCESS_LEVEL.MANAGER : ACCESS_LEVEL.ADMIN;

  return eligibleEmployees
    .filter(
      (employee) =>
        (resolveDemoAuth(employee.username)?.permission ?? ACCESS_LEVEL.NONE) >=
        minimumPermission,
    )
    .map((employee) => employee.username);
}

function assertRoutingResolved(
  assigneeUsernames: string[],
  categoryId: string,
) {
  if (assigneeUsernames.length > 0) {
    return;
  }

  throw new ApiError(
    "serviceDesk.ticketCommand.localDemo.assigneeUnavailable",
    409,
    { categoryId },
  );
}
