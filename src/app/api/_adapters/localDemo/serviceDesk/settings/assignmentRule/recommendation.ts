import {
  getActiveLocalEmployeesByCompanyId,
  getServiceDeskCategoryContext,
  type LocalCompanyEmployee,
  type ServiceDeskCategoryContext,
} from "@/app/api/_adapters/localDemo/serviceDesk/eligibility";
import { getLocalCategoryTrees } from "@/app/api/_adapters/localDemo/serviceDesk/settings/category";
import { getLocalDemoAssignmentRules } from "@/app/api/_adapters/localDemo/serviceDesk/settings/state";
import type { AssignmentRule, MainCategory } from "@/domain/serviceDesk";
import { ApiError } from "@/lib/application/api";
import { camelAssignmentRuleMapper } from "@/lib/application/contracts/serviceDesk";
import {
  type AssignmentRecommendationInput,
  type AssignmentRecommendationResult,
  type AssignmentRecommendationSource,
  EMPTY_ASSIGNMENT_RECOMMENDATION,
} from "@/lib/application/contracts/serviceDesk";
import { getLocalizedText } from "@/lib/application/i18n";
import type { ImageValueLabel, Locale } from "@/shared/types";

type LocalRecommendationContext = {
  input: AssignmentRecommendationInput;
};

type RecommendationCollectionContext = {
  assignmentRule: AssignmentRule;
  assigneeUsernames: string[];
  employees: LocalCompanyEmployee[];
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

const getEmployeeLabel = (employee: LocalCompanyEmployee, language: Locale) => {
  const localizedName = employee.name[language] ?? employee.name.en;

  return [localizedName.first, localizedName.middle, localizedName.last]
    .filter(Boolean)
    .join(" ");
};

const toRecommendedUser = (
  employee: LocalCompanyEmployee,
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
  const category = await getServiceDeskCategoryContext(input.categoryId);

  if (!category || !category.tenant.active) {
    throw new ApiError(
      "serviceDesk.tickets.localDemo.categoryNotFound",
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

  const companyEmployees = getActiveLocalEmployeesByCompanyId(
    category.tenant.companyId,
  );

  return {
    recommendedUsers: collectRecommendedUsers({
      assignmentRule,
      assigneeUsernames: input.assigneeUsernames,
      employees: companyEmployees,
      language,
    }),
    source: resolveRecommendationSource(assignmentRule),
    selectedCategoryLabel,
  };
};
