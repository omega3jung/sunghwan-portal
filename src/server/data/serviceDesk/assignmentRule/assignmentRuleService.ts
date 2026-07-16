import { ApiError } from "@/lib/application/api";
import { getLocalizedText } from "@/lib/application/i18n";
import type { EmployeeResponseDto } from "@/server/data/organization/employees";
import { getEligibleEmployeesForCategory } from "@/server/data/organization/employees";
import { getServiceDeskCategoryContext } from "@/server/data/serviceDesk/category";
import type { ImageValueLabel, Locale } from "@/shared/types";

import type { CategoryDto } from "../category/categoryDto";
import { findCategoryRowsByTenantIdAndCategoryId } from "../category/categoryRepository";
import { getCategoryTreeByTenantId } from "../category/categoryService";
import { getActiveTenantById, getActiveTenants } from "../tenant";
import {
  AssignmentRecommendationInputDto,
  AssignmentRecommendationResultDto,
  AssignmentRecommendationSourceDto,
  AssignmentRuleDto,
  CreateAssignmentRuleInputDto,
  UpdateAssignmentRuleInputDto,
} from "./assignmentRuleDto";
import {
  mapAssignmentRuleRowsToDtos,
  mapAssignmentRuleRowToDto,
  mapCreateAssignmentRuleInputDtoToRowInput,
  mapUpdateAssignmentRuleInputDtoToRowInput,
} from "./assignmentRuleMapper";
import {
  createAssignmentRuleRow,
  deleteAssignmentRuleRowById,
  findAssignmentRuleRowByTenantIdAndAssignmentRuleId,
  findAssignmentRuleRowsByTenantId,
  findAssignmentRuleRowsByTenantIdAndCategoryId,
  updateAssignmentRuleRowById,
} from "./assignmentRuleRepository";

export async function getAssignmentRulesByTenantId(
  tenantId: string | number,
): Promise<AssignmentRuleDto[]> {
  const rows = await findAssignmentRuleRowsByTenantId(tenantId);

  return mapAssignmentRuleRowsToDtos(rows);
}

export type GetAssignmentRulesResponseParams = {
  tenantId?: string | number | null;
  isInternal: boolean;
};

export type GetAssignmentRecommendationResponseParams = {
  input: AssignmentRecommendationInputDto;
  tenantId?: string | number | null;
  isInternal?: boolean;
};

export async function getAssignmentRulesResponseByTenantId({
  tenantId,
  isInternal,
}: GetAssignmentRulesResponseParams): Promise<AssignmentRuleDto[]> {
  const targetTenantId = await resolveTargetTenantId({
    tenantId,
    isInternal,
  });

  return getAssignmentRulesByTenantId(targetTenantId);
}

export async function getAssignmentRecommendationResponse({
  input,
}: GetAssignmentRecommendationResponseParams): Promise<AssignmentRecommendationResultDto> {
  const categoryContext = await getServiceDeskCategoryContext(
    "REMOTE",
    input.categoryId,
  );

  if (!categoryContext || !categoryContext.tenant.active) {
    throw new ApiError("serviceDesk.common.notFound", 404);
  }

  const targetTenantId = categoryContext.tenant.id;
  const language = input.language ?? "en";
  const [categories, rules] = await Promise.all([
    getCategoryTreeByTenantId(targetTenantId),
    getAssignmentRulesByTenantId(targetTenantId),
  ]);
  const selectedCategoryLabel = getCategoryLabel(
    categories,
    input.categoryId,
    language,
  );
  const assignmentRule = resolveAssignmentRuleWithCategoryFallback(
    rules,
    categories,
    input.categoryId,
  );

  if (!assignmentRule) {
    return createEmptyRecommendation(selectedCategoryLabel);
  }

  const activeEmployees = await getEligibleEmployeesForCategory({
    dataScope: "REMOTE",
    category: categoryContext,
    purpose: "ASSIGNMENT",
    includeTenantCompany:
      assignmentRule.assignee.include_tenant_company === true,
  });

  return {
    recommendedUsers: collectRecommendedUsers({
      assignmentRule,
      assigneeUsernames: input.assigneeUsernames,
      activeEmployees,
      language,
    }),
    source: resolveRecommendationSource(assignmentRule),
    selectedCategoryLabel,
  };
}

export async function createAssignmentRule(
  input: CreateAssignmentRuleInputDto,
): Promise<AssignmentRuleDto> {
  await assertActiveTenantExists(input.tenant_id);
  await assertActiveCategoryExistsInTenant(input.tenant_id, input.category_id, {
    messageKey: "serviceDesk.assignmentRules.categoryNotFound",
  });

  const duplicateRules = await findAssignmentRuleRowsByTenantIdAndCategoryId(
    input.tenant_id,
    input.category_id,
  );

  if (duplicateRules.length > 0) {
    throw createStatusError(
      `Assignment rule already exists for category ${input.category_id}.`,
      409,
    );
  }

  const row = await createAssignmentRuleRow(
    mapCreateAssignmentRuleInputDtoToRowInput(input),
  );

  if (!row) {
    throw new Error("Failed to create assignment rule.");
  }

  return mapAssignmentRuleRowToDto(row);
}

export async function updateAssignmentRuleById(
  tenantId: string | number,
  assignmentRuleId: string | number,
  input: UpdateAssignmentRuleInputDto,
): Promise<AssignmentRuleDto> {
  const currentRow = await findAssignmentRuleRowByTenantIdAndAssignmentRuleId(
    tenantId,
    assignmentRuleId,
  );

  if (!currentRow) {
    throw new ApiError("serviceDesk.common.notFound", 404);
  }

  await assertActiveCategoryExistsInTenant(tenantId, input.category_id, {
    messageKey: "serviceDesk.assignmentRules.categoryNotFound",
  });

  const duplicateRules = await findAssignmentRuleRowsByTenantIdAndCategoryId(
    tenantId,
    input.category_id,
  );
  const hasDuplicateRule = duplicateRules.some(
    (row) => Number(row.ar_id) !== Number(currentRow.ar_id),
  );

  if (hasDuplicateRule) {
    throw createStatusError(
      `Assignment rule already exists for category ${input.category_id}.`,
      409,
    );
  }

  const row = await updateAssignmentRuleRowById(
    tenantId,
    assignmentRuleId,
    mapUpdateAssignmentRuleInputDtoToRowInput(input),
  );

  if (!row) {
    throw new ApiError("serviceDesk.common.notFound", 404);
  }

  return mapAssignmentRuleRowToDto(row);
}

export async function deleteAssignmentRuleById(
  tenantId: string | number,
  assignmentRuleId: string | number,
): Promise<AssignmentRuleDto> {
  const row = await deleteAssignmentRuleRowById(tenantId, assignmentRuleId);

  if (!row) {
    throw new ApiError("serviceDesk.common.notFound", 404);
  }

  return mapAssignmentRuleRowToDto(row);
}

async function resolveTargetTenantId({
  tenantId,
  isInternal: _isInternal,
}: GetAssignmentRulesResponseParams): Promise<number> {
  if (hasTenantId(tenantId)) {
    const tenant = await getActiveTenantById(tenantId);

    if (!tenant) {
      throw new Error(`Active tenant not found: ${tenantId}`);
    }

    return tenant.tenant_id;
  }

  const tenant = (await getActiveTenants())[0];

  if (!tenant) {
    throw new Error("Active tenant not found");
  }

  return tenant.tenant_id;
}

function hasTenantId(value?: string | number | null): value is string | number {
  if (value === null || value === undefined) {
    return false;
  }

  return String(value).trim().length > 0;
}

function createEmptyRecommendation(
  selectedCategoryLabel = "",
): AssignmentRecommendationResultDto {
  return {
    recommendedUsers: [],
    source: null,
    selectedCategoryLabel,
  };
}

function getCategoryLabel(
  categories: CategoryDto[],
  categoryId: string,
  language: Locale,
) {
  for (const category of categories) {
    for (const subCategory of category.sub_category) {
      if (String(subCategory.category_id) === categoryId) {
        return getLocalizedText(subCategory.category_name, language) ?? "";
      }
    }
  }

  return "";
}

function findMainCategoryIdByCategoryId(
  categories: CategoryDto[],
  categoryId: string,
) {
  for (const category of categories) {
    const subCategory = category.sub_category.find(
      (item) => String(item.category_id) === categoryId,
    );

    if (subCategory) {
      return category.category_id;
    }
  }

  return null;
}

function resolveAssignmentRuleWithCategoryFallback(
  rules: AssignmentRuleDto[],
  categories: CategoryDto[],
  categoryId: string,
) {
  const exactAssignmentRule = rules.find(
    (rule) => String(rule.category_id) === categoryId,
  );

  if (exactAssignmentRule) {
    return exactAssignmentRule;
  }

  const mainCategoryId = findMainCategoryIdByCategoryId(categories, categoryId);

  if (mainCategoryId === null) {
    return undefined;
  }

  return rules.find((rule) => rule.category_id === mainCategoryId);
}

function collectRecommendedUsers({
  assignmentRule,
  assigneeUsernames,
  activeEmployees,
  language,
}: {
  assignmentRule: AssignmentRuleDto;
  assigneeUsernames: string[];
  activeEmployees: RecommendationEmployee[];
  language: Locale;
}) {
  const activeEmployeeMap = new Map(
    activeEmployees.map((employee) => [employee.username, employee]),
  );
  const excludedIds = new Set(assigneeUsernames);
  const seen = new Set<string>();
  const recommendedUsers: ImageValueLabel[] = [];

  for (const employeeUserName of assignmentRule.assignee.employee_username) {
    const employee = activeEmployeeMap.get(employeeUserName);

    pushUniqueUser(
      recommendedUsers,
      seen,
      excludedIds,
      employee ? toRecommendedUser(employee, language) : undefined,
    );
  }

  for (const jobFieldId of assignmentRule.assignee.job_field_id) {
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
}

function pushUniqueUser(
  items: ImageValueLabel[],
  seen: Set<string>,
  excludedIds: Set<string>,
  user: ImageValueLabel | undefined,
) {
  if (!user || seen.has(user.value) || excludedIds.has(user.value)) {
    return;
  }

  seen.add(user.value);
  items.push(user);
}

function toRecommendedUser(
  employee: RecommendationEmployee,
  language: Locale,
): ImageValueLabel {
  return {
    value: employee.username,
    label: getEmployeeLabel(employee, language),
    displayName: employee.email,
    image: employee.imageUrl ?? undefined,
  };
}

function getEmployeeLabel(employee: RecommendationEmployee, language: Locale) {
  const localizedName = employee.name[language] ?? employee.name.en;

  return [localizedName.first, localizedName.middle, localizedName.last]
    .filter(Boolean)
    .join(" ");
}

type RecommendationEmployee = Pick<
  EmployeeResponseDto,
  "username" | "name" | "email" | "imageUrl" | "jobFieldId"
>;

function resolveRecommendationSource(
  assignmentRule: AssignmentRuleDto,
): AssignmentRecommendationSourceDto | null {
  const hasDirectRecommendation =
    assignmentRule.assignee.employee_username.length > 0;
  const hasJobFieldRecommendation =
    assignmentRule.assignee.job_field_id.length > 0;

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
}

async function assertActiveTenantExists(tenantId: string | number) {
  const tenant = await getActiveTenantById(tenantId);

  if (!tenant) {
    throw new ApiError("serviceDesk.common.notFound", 404);
  }

  return tenant;
}

async function assertActiveCategoryExistsInTenant(
  tenantId: string | number,
  categoryId: string | number,
  options: {
    messageKey: string;
  },
): Promise<void> {
  const rows = await findCategoryRowsByTenantIdAndCategoryId(
    tenantId,
    categoryId,
  );
  const targetRow = rows.find(
    (row) => Number(row.cat_id) === Number(categoryId),
  );

  if (!targetRow || targetRow.cat_active === false) {
    throw new ApiError(options.messageKey, 404, { categoryId });
  }
}

function createStatusError(message: string, status: number) {
  const error = new Error(message) as Error & { status: number };
  error.status = status;
  return error;
}
