import { ApiError } from "@/lib/application/api";
import type { SaveServiceDeskAssignmentRuleTreePayload } from "@/lib/application/contracts/serviceDesk";
import { getLocalizedText } from "@/lib/application/i18n";
import {
  canManageServiceDeskSettings,
  resolveSettingsAccess,
  type ServiceDeskSettingsPrincipal,
} from "@/lib/application/serviceDesk";
import type { EmployeeResponseDto } from "@/server/data/organization/employees";
import { getEmployeesByCompanyId } from "@/server/data/organization/employees";
import { getServiceDeskCategoryContext } from "@/server/data/serviceDesk/category";
import type { PortalApiQueryExecutor } from "@/server/shared/supabase/portalApiClient";
import type { ImageValueLabel, Locale } from "@/shared/types";

import type { CategoryDto } from "../category/categoryDto";
import { getCategoryTreeByTenantId } from "../category/categoryService";
import {
  getActiveTenantById,
  getActiveTenants,
  type ServiceDeskSettingsTenantContext,
} from "../tenant";
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
  updateAssignmentRuleRowById,
} from "./assignmentRuleRepository";

export async function getAssignmentRulesByTenantId(
  tenantId: string | number,
  query?: PortalApiQueryExecutor,
): Promise<AssignmentRuleDto[]> {
  const rows = await findAssignmentRuleRowsByTenantId(tenantId, query);

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

export async function validateAssignmentRuleTreeMutation({
  principal,
  tenant,
  payload,
}: {
  principal: ServiceDeskSettingsPrincipal;
  tenant: ServiceDeskSettingsTenantContext;
  payload: SaveServiceDeskAssignmentRuleTreePayload;
}) {
  const submittedCategoryIds = new Set<string>();

  for (const category of payload.categories) {
    const categoryContext = await getServiceDeskCategoryContext(category.id);

    if (
      !categoryContext ||
      categoryContext.tenant.id !== tenant.id ||
      categoryContext.mainCategoryId !== category.id ||
      submittedCategoryIds.has(category.id)
    ) {
      throw createStatusError(
        "Assignment settings must reference each target main category once.",
        400,
      );
    }

    const access = resolveSettingsAccess(principal, {
      resource: "ASSIGNMENT_RULE",
      tenantCompanyId: tenant.companyId,
      isOwnerTenant: tenant.isOwnerTenant,
      scope: categoryContext.scope,
    });

    if (!canManageServiceDeskSettings(access)) {
      throw createStatusError(
        "Assignment settings are read-only for this category scope.",
        403,
      );
    }

    submittedCategoryIds.add(category.id);

    for (const subCategory of category.subCategories) {
      const subCategoryContext = await getServiceDeskCategoryContext(
        subCategory.id,
      );

      if (
        !subCategoryContext ||
        subCategoryContext.tenant.id !== tenant.id ||
        subCategoryContext.mainCategoryId !== category.id ||
        submittedCategoryIds.has(subCategory.id)
      ) {
        throw createStatusError(
          "An assignment rule cannot move to another category or tenant.",
          400,
        );
      }

      submittedCategoryIds.add(subCategory.id);
    }
  }

  return submittedCategoryIds;
}

export async function getAssignmentRecommendationResponse({
  input,
}: GetAssignmentRecommendationResponseParams): Promise<AssignmentRecommendationResultDto> {
  const categoryContext = await getServiceDeskCategoryContext(input.categoryId);

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

  const activeEmployees = await getEmployeesByCompanyId(
    true,
    categoryContext.tenant.companyId,
  );

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
  query?: PortalApiQueryExecutor,
): Promise<AssignmentRuleDto> {
  const row = await createAssignmentRuleRow(
    mapCreateAssignmentRuleInputDtoToRowInput(input),
    query,
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
  query?: PortalApiQueryExecutor,
): Promise<AssignmentRuleDto> {
  const currentRow = await findAssignmentRuleRowByTenantIdAndAssignmentRuleId(
    tenantId,
    assignmentRuleId,
    query,
  );

  if (!currentRow) {
    throw new ApiError("serviceDesk.common.notFound", 404);
  }

  const row = await updateAssignmentRuleRowById(
    tenantId,
    assignmentRuleId,
    mapUpdateAssignmentRuleInputDtoToRowInput(input),
    query,
  );

  if (!row) {
    throw new ApiError("serviceDesk.common.notFound", 404);
  }

  return mapAssignmentRuleRowToDto(row);
}

export async function deleteAssignmentRuleById(
  tenantId: string | number,
  assignmentRuleId: string | number,
  query?: PortalApiQueryExecutor,
): Promise<AssignmentRuleDto> {
  const row = await deleteAssignmentRuleRowById(
    tenantId,
    assignmentRuleId,
    query,
  );

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

function createStatusError(message: string, status: number) {
  return Object.assign(new Error(message), { status });
}
