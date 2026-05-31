import type { Employee } from "@/domain/organization";
import type { AssignmentRule, MainCategory } from "@/domain/serviceDesk";
import { camelEmployeeMapper } from "@/feature/organization/employee";
import { camelAssignmentRuleMapper } from "@/feature/serviceDesk/assignmentRule/mapper";
import {
  type AssignmentRecommendationInput,
  type AssignmentRecommendationResult,
  type AssignmentRecommendationSource,
  EMPTY_ASSIGNMENT_RECOMMENDATION,
} from "@/feature/serviceDesk/assignmentRule/recommendation";
import { camelClientCategoryTreeMapper } from "@/feature/serviceDesk/category/mapper";
import { createEmployeesMock } from "@/mocks/domain/organization/employee";
import {
  clientCategorySettingsMock,
  internalCategorySettingsMock,
} from "@/mocks/domain/serviceDesk/categories";
import type { ImageValueLabel, Locale } from "@/shared/types";
import { getLocalizedText } from "@/shared/utils/i18n";

import { getLocalDemoAssignmentRules } from "../../state";

type LocalRecommendationContext = {
  input: AssignmentRecommendationInput;
  isInternal: boolean;
};

type RecommendationCollectionContext = {
  assignmentRule: AssignmentRule;
  assigneeIds: string[];
  employees: Employee[];
  language: Locale;
};

const buildCategoryList = (isInternal: boolean) => {
  const trees = camelClientCategoryTreeMapper(
    isInternal ? internalCategorySettingsMock : clientCategorySettingsMock,
  );

  return trees.flatMap((tree) => tree.categories);
};

const buildEmployees = () => camelEmployeeMapper(createEmployeesMock());

const findMainCategoryIdByCategoryId = (
  categories: MainCategory[],
  categoryId: string,
) => {
  let result = undefined;

  for (let i = 0; i < categories.length && !result; i++) {
    const subCategory = categories[i].subCategories.find(
      (item) => item.id === categoryId,
    );
    if (subCategory) {
      result = categories[i].id;
    }
  }

  return result;
};

const getCategoryLabel = (
  categories: MainCategory[],
  categoryId: string,
  language: Locale,
): string => {
  for (const category of categories) {
    for (const subCategory of category.subCategories) {
      if (subCategory.id === categoryId) {
        return getLocalizedText(subCategory.name, language) ?? "";
      }
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

const getEmployeeLabel = (employee: Employee, language: Locale) => {
  const localizedName = employee.name[language] ?? employee.name.en;

  return `${localizedName.first} ${localizedName.last}`.trim();
};

const toRecommendedUser = (
  employee: Employee,
  language: Locale,
): ImageValueLabel => ({
  value: employee.userName,
  label: getEmployeeLabel(employee, language),
  displayName: employee.email,
  image: employee.imageUrl,
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
  categories: MainCategory[],
  categoryId: string,
) => {
  const exactAssignmentRule = rules.find(
    (item) => item.categoryId === categoryId,
  );

  if (exactAssignmentRule) {
    return exactAssignmentRule;
  }

  const mainCategoryId = findMainCategoryIdByCategoryId(categories, categoryId);

  if (!mainCategoryId) {
    return undefined;
  }

  return rules.find((item) => item.categoryId === mainCategoryId);
};

const buildEmployeeMap = (employees: Employee[]) =>
  new Map(employees.map((employee) => [employee.userName, employee]));

const buildActiveEmployees = (employees: Employee[]) =>
  employees.filter((employee) => employee.active);

const buildActiveEmployeeMap = (activeEmployees: Employee[]) =>
  new Map(activeEmployees.map((employee) => [employee.userName, employee]));

const collectRecommendedUsers = ({
  assignmentRule,
  assigneeIds,
  employees,
  language,
}: RecommendationCollectionContext) => {
  const employeeMap = buildEmployeeMap(employees);
  const activeEmployees = buildActiveEmployees(employees);
  const activeEmployeeMap = buildActiveEmployeeMap(activeEmployees);
  const excludedIds = new Set(assigneeIds);
  const seen = new Set<string>();
  const recommendedUsers: ImageValueLabel[] = [];

  for (const employeeUserName of assignmentRule.assignee.employeeIds) {
    const employee =
      activeEmployeeMap.get(employeeUserName) ??
      employeeMap.get(employeeUserName);

    pushUniqueUser(
      recommendedUsers,
      seen,
      excludedIds,
      employee ? toRecommendedUser(employee, language) : undefined,
    );
  }

  for (const jobFieldId of assignmentRule.assignee.jobFieldIds) {
    for (const activeEmployee of activeEmployees) {
      if (activeEmployee.jobFieldId !== jobFieldId) {
        continue;
      }

      pushUniqueUser(
        recommendedUsers,
        seen,
        excludedIds,
        toRecommendedUser(activeEmployee, language),
      );
    }
  }

  return recommendedUsers;
};

const resolveRecommendationSource = (
  assignmentRule: AssignmentRule,
): AssignmentRecommendationSource | null => {
  const hasDirectRecommendation =
    assignmentRule.assignee.employeeIds.length > 0;
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

export const resolveLocalAssignmentRecommendation = ({
  input,
  isInternal,
}: LocalRecommendationContext): AssignmentRecommendationResult => {
  const language = input.language ?? "en";
  const categories = buildCategoryList(isInternal);
  const selectedCategoryLabel = getCategoryLabel(
    categories,
    input.categoryId,
    language,
  );
  const assignmentRule = resolveAssignmentRuleWithCategoryFallback(
    camelAssignmentRuleMapper(getLocalDemoAssignmentRules(isInternal)),
    categories,
    input.categoryId,
  );

  if (!assignmentRule) {
    return createEmptyRecommendation(selectedCategoryLabel);
  }

  const recommendedUsers = collectRecommendedUsers({
    assignmentRule,
    assigneeIds: input.assigneeIds,
    employees: buildEmployees(),
    language,
  });

  return {
    recommendedUsers,
    source: resolveRecommendationSource(assignmentRule),
    selectedCategoryLabel,
  };
};
