import type { CategoryScope } from "../category";
import type { AssigneeGroup, AssignmentRule } from "./model";
import { resolveAssignmentEligibleCompanyIds } from "./policy";

export function hasAssignmentRuleSelection(
  assignee: Pick<AssigneeGroup, "jobFieldIds" | "assigneeUsernames">,
) {
  return (
    assignee.jobFieldIds.length > 0 || assignee.assigneeUsernames.length > 0
  );
}

/**
 * Resolves a subcategory's own rule first and falls back only when that rule
 * does not exist. An existing but currently invalid rule never falls through.
 */
export function resolveEffectiveAssignmentRule(
  assignmentRules: readonly AssignmentRule[],
  categoryId: string,
  mainCategoryId: string = categoryId,
) {
  const ownRule = assignmentRules.find(
    (assignmentRule) => assignmentRule.categoryId === categoryId,
  );

  if (ownRule || mainCategoryId === categoryId) {
    return ownRule;
  }

  return assignmentRules.find(
    (assignmentRule) => assignmentRule.categoryId === mainCategoryId,
  );
}

/**
 * Checks activation readiness from the active state of referenced records.
 * This deliberately does not expand a Job Field to employees; full employee,
 * company, tenant, and routing eligibility remains a routing-time concern.
 */
export function hasEffectiveValidWorker(
  assignee: Pick<AssigneeGroup, "jobFieldIds" | "assigneeUsernames">,
  jobFields: readonly { id: string; active: boolean }[],
  employees: readonly { username: string; active: boolean }[],
) {
  const activeJobFieldIds = new Set(
    jobFields
      .filter((jobField) => jobField.active)
      .map((jobField) => jobField.id),
  );
  const activeEmployeeUsernames = new Set(
    employees
      .filter((employee) => employee.active)
      .map((employee) => employee.username),
  );

  return (
    assignee.jobFieldIds.some((id) => activeJobFieldIds.has(id)) ||
    assignee.assigneeUsernames.some((username) =>
      activeEmployeeUsernames.has(username),
    )
  );
}

/** Projects the positive capability used by Category activation controls. */
export function canActivateCategory({
  assignmentRules,
  categoryId,
  mainCategoryId,
  jobFields,
  employees,
  scope,
  tenantCompanyId,
  ownerCompanyId,
}: {
  assignmentRules: readonly AssignmentRule[];
  categoryId: string;
  mainCategoryId?: string;
  jobFields: readonly { id: string; active: boolean; companyId: string }[];
  employees: readonly {
    username: string;
    active: boolean;
    companyId: string;
  }[];
  scope: CategoryScope;
  tenantCompanyId: string;
  ownerCompanyId: string;
}) {
  const assignmentRule = resolveEffectiveAssignmentRule(
    assignmentRules,
    categoryId,
    mainCategoryId,
  );
  const eligibleCompanyIds = new Set(
    assignmentRule
      ? resolveAssignmentEligibleCompanyIds({
          scope,
          tenantCompanyId,
          ownerCompanyId,
          includeTenantCompany: assignmentRule.assignee.includeTenantCompany,
        })
      : [],
  );

  return Boolean(
    assignmentRule &&
    hasEffectiveValidWorker(
      assignmentRule.assignee,
      jobFields.filter((item) => eligibleCompanyIds.has(item.companyId)),
      employees.filter((item) => eligibleCompanyIds.has(item.companyId)),
    ),
  );
}
