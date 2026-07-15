import { ServiceDeskApiError } from "@/app/api/service-desk/_shared/messages";
import type { AssignmentRule, MainCategory } from "@/domain/serviceDesk";
import { camelAssignmentRuleMapper } from "@/feature/serviceDesk/assignmentRule/mapper";
import {
  type AssignmentRecommendationInput,
  type AssignmentRecommendationResult,
  type AssignmentRecommendationSource,
  EMPTY_ASSIGNMENT_RECOMMENDATION,
} from "@/feature/serviceDesk/assignmentRule/recommendation";
import { getLocalizedText } from "@/lib/application/i18n";
import {
  type EligibleEmployee,
  getEligibleEmployeesForCategory,
} from "@/server/data/organization/employees";
import {
  getServiceDeskCategoryContext,
  type ServiceDeskCategoryContext,
} from "@/server/data/serviceDesk/category";
import { getLocalCategoryTrees } from "@/server/serviceDesk/settings/category/localDemo";
import type { ImageValueLabel, Locale } from "@/shared/types";

import { getLocalDemoAssignmentRules } from "../../state";

type LocalRecommendationContext = {
  input: AssignmentRecommendationInput;
};

type RecommendationCollectionContext = {
  assignmentRule: AssignmentRule;
  assigneeUsernames: string[];
  employees: EligibleEmployee[];
  language: Locale;
};

const getCategoryLabel = (
  categories: MainCategory[],
  categoryId: string,
  language: Locale,
): string => {
  for (const category of categories) {
    if (category.id === categoryId) {
      return getLocalizedText(category.name, language) ?? "";
    }

    const subCategory = category.subCategories.find(
      (item) => item.id === categoryId,
    );

    if (subCategory) {
      return getLocalizedText(subCategory.name, language) ?? "";
    }
  }

  return "";
};

const createEmptyRecommendation = (
  selectedCategoryLabel = "",
): AssignmentRecommendationResult => ({
  ...EMPTY_ASSIGNMENT_RECOMMENDATION,
  selectedCategoryLabel,
});

const getEmployeeLabel = (employee: EligibleEmployee, language: Locale) => {
  const localizedName = employee.name[language] ?? employee.name.en;

  return [localizedName.first, localizedName.middle, localizedName.last]
    .filter(Boolean)
    .join(" ");
};

const toRecommendedUser = (
  employee: EligibleEmployee,
  language: Locale,
): ImageValueLabel => ({
  value: employee.username,
  label: getEmployeeLabel(employee, language),
  displayName: employee.email,
  image: employee.imageUrl ?? undefined,
});

const pushUniqueUser = (
  items: ImageValueLabel[],
  seen: Set<string>,
  excludedIds: Set<string>,
  user: ImageValueLabel | undefined,
) => {
  if (!user || seen.has(user.value) || excludedIds.has(user.value)) {
    return;
  }

  seen.add(user.value);
  items.push(user);
};

const resolveAssignmentRuleWithCategoryFallback = (
  rules: AssignmentRule[],
  category: ServiceDeskCategoryContext,
) => {
  const exactAssignmentRule = rules.find(
    (item) => item.categoryId === category.categoryId,
  );

  if (exactAssignmentRule) {
    return exactAssignmentRule;
  }

  return rules.find((item) => item.categoryId === category.mainCategoryId);
};

const collectRecommendedUsers = ({
  assignmentRule,
  assigneeUsernames,
  employees,
  language,
}: RecommendationCollectionContext) => {
  const eligibleEmployeeMap = new Map(
    employees.map((employee) => [employee.username, employee]),
  );
  const excludedIds = new Set(assigneeUsernames);
  const seen = new Set<string>();
  const recommendedUsers: ImageValueLabel[] = [];

  for (const employeeUserName of assignmentRule.assignee.assigneeUsernames) {
    const employee = eligibleEmployeeMap.get(employeeUserName);

    pushUniqueUser(
      recommendedUsers,
      seen,
      excludedIds,
      employee ? toRecommendedUser(employee, language) : undefined,
    );
  }

  for (const jobFieldId of assignmentRule.assignee.jobFieldIds) {
    for (const employee of employees) {
      if (String(employee.jobFieldId) !== jobFieldId) {
        continue;
      }

      pushUniqueUser(
        recommendedUsers,
        seen,
        excludedIds,
        toRecommendedUser(employee, language),
      );
    }
  }

  return recommendedUsers;
};

const resolveRecommendationSource = (
  assignmentRule: AssignmentRule,
): AssignmentRecommendationSource | null => {
  const hasDirectRecommendation =
    assignmentRule.assignee.assigneeUsernames.length > 0;
  const hasJobFieldRecommendation =
    assignmentRule.assignee.jobFieldIds.length > 0;

  if (hasDirectRecommendation && hasJobFieldRecommendation) {
    return "mixed";
  }

  if (hasDirectRecommendation) {
    return "employee";
  }

  if (hasJobFieldRecommendation) {
    return "jobField";
  }

  return null;
};

export const resolveLocalAssignmentRecommendation = async ({
  input,
}: LocalRecommendationContext): Promise<AssignmentRecommendationResult> => {
  const category = await getServiceDeskCategoryContext(
    "LOCAL",
    input.categoryId,
  );

  if (!category || !category.tenant.active) {
    throw new ServiceDeskApiError(
      "api.tickets.localDemo.categoryNotFound",
      404,
      { categoryId: input.categoryId },
    );
  }

  const language = input.language ?? "en";
  const categories =
    getLocalCategoryTrees(category.tenant.isOwnerTenant).find(
      (tenant) => tenant.id === category.tenant.id,
    )?.categories ?? [];
  const selectedCategoryLabel = getCategoryLabel(
    categories,
    input.categoryId,
    language,
  );
  const assignmentRule = resolveAssignmentRuleWithCategoryFallback(
    camelAssignmentRuleMapper(
      getLocalDemoAssignmentRules(category.tenant.isOwnerTenant),
    ),
    category,
  );

  if (!assignmentRule) {
    return createEmptyRecommendation(selectedCategoryLabel);
  }

  const eligibleEmployees = await getEligibleEmployeesForCategory({
    dataScope: "LOCAL",
    category,
    purpose: "ASSIGNMENT",
    includeTenantCompany: assignmentRule.assignee.includeTenantCompany === true,
  });

  return {
    recommendedUsers: collectRecommendedUsers({
      assignmentRule,
      assigneeUsernames: input.assigneeUsernames,
      employees: eligibleEmployees,
      language,
    }),
    source: resolveRecommendationSource(assignmentRule),
    selectedCategoryLabel,
  };
};
