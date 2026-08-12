import {
  getLocalDemoAssignmentRules,
  getLocalDemoCategories,
} from "@/app/api/_adapters/localDemo/serviceDesk/settings/state";
import { OWNER_COMPANY_ID } from "@/domain/organization";
import { type AssignmentRule, canActivateCategory } from "@/domain/serviceDesk";
import { ApiError } from "@/lib/application/api";
import type { SaveServiceDeskCategoryTreePayload } from "@/lib/application/contracts/serviceDesk";
import { allEmployeesMock } from "@/mocks/domain/organization/employee";
import { allJobFieldsMock } from "@/mocks/domain/organization/jobFields";

import {
  createCategoryIdAssigner,
  getTenantIndexById,
  normalizeTenantTree,
  sortCategories,
} from "./categoryUtils";
import { buildSynchronizedCategory } from "./treeSync";

/**
 * Reconciles one submitted category tree into mutable LOCAL settings state.
 *
 * Submitted nodes are updated or assigned stable demo IDs. Existing nodes not
 * present in the payload are preserved because category removal is modeled as
 * deactivation, protecting references held by existing tickets and history.
 */
export const localSaveCategoryTree = ({
  isInternal,
  payload,
}: {
  isInternal: boolean;
  payload: SaveServiceDeskCategoryTreePayload;
}) => {
  const items = getLocalDemoCategories(isInternal);
  const tenantIndex = getTenantIndexById(items, payload.tenantId);

  if (tenantIndex === -1) {
    throw new ApiError("serviceDesk.categories.localDemo.tenantNotFound", 404, {
      tenantId: payload.tenantId,
    });
  }

  const targetTenant = items[tenantIndex];

  assertLocalCategoryActivationReady({
    isInternal,
    targetTenant,
    payload,
  });

  const previousCategoryMap = new Map(
    targetTenant.category.map((category) => [
      String(category.category_id),
      category,
    ]),
  );
  const assignId = createCategoryIdAssigner(items);
  const synchronizedCategories = payload.categories.map(
    (category, categoryIndex) =>
      buildSynchronizedCategory({
        category: {
          ...category,
          index: categoryIndex + 1,
        },
        previousCategory: category.id
          ? previousCategoryMap.get(category.id)
          : undefined,
        assignId,
      }),
  );
  const submittedIds = new Set(
    synchronizedCategories.map((category) => String(category.category_id)),
  );
  const preservedCategories = targetTenant.category
    .filter((category) => !submittedIds.has(String(category.category_id)))
    .sort((left, right) => left.category_index - right.category_index);

  targetTenant.category = sortCategories([
    ...synchronizedCategories,
    ...preservedCategories,
  ]);

  return normalizeTenantTree(targetTenant);
};

function assertLocalCategoryActivationReady({
  isInternal,
  targetTenant,
  payload,
}: {
  isInternal: boolean;
  targetTenant: ReturnType<typeof getLocalDemoCategories>[number];
  payload: SaveServiceDeskCategoryTreePayload;
}) {
  const assignmentRules: AssignmentRule[] = getLocalDemoAssignmentRules(
    isInternal,
  ).map((assignmentRule) => ({
    categoryId: String(assignmentRule.category_id),
    assignee: {
      jobFieldIds: assignmentRule.assignee.job_field_id.map(String),
      assigneeUsernames: assignmentRule.assignee.employee_username,
      includeTenantCompany:
        assignmentRule.assignee.include_tenant_company === true,
    },
  }));
  const jobFields = allJobFieldsMock.map((jobField) => ({
    id: String(jobField.jf_id),
    active: jobField.jf_active,
    companyId: String(jobField.jf_company_id),
  }));
  const employees = allEmployeesMock.map((employee) => ({
    username: employee.e_username,
    active: employee.e_active,
    companyId: String(employee.e_company_id),
  }));
  const tenantCompanyId = String(targetTenant.tenant_company_id);
  const currentCategoriesById = new Map(
    targetTenant.category.map((category) => [
      String(category.category_id),
      category,
    ]),
  );

  for (const category of payload.categories) {
    if (!category.id) {
      continue;
    }

    const currentCategory = currentCategoriesById.get(category.id);

    if (!currentCategory) {
      continue;
    }

    if (!currentCategory.category_active && category.active) {
      assertCategoryReady({
        categoryId: category.id,
        assignmentRules,
        jobFields,
        employees,
        scope: category.scope,
        tenantCompanyId,
        ownerCompanyId: OWNER_COMPANY_ID,
      });
    }

    const currentSubCategoriesById = new Map(
      currentCategory.sub_category.map((subCategory) => [
        String(subCategory.category_id),
        subCategory,
      ]),
    );

    for (const subCategory of category.subCategories) {
      if (!subCategory.id) {
        continue;
      }

      const currentSubCategory = currentSubCategoriesById.get(subCategory.id);

      if (
        currentSubCategory &&
        !currentSubCategory.category_active &&
        subCategory.active
      ) {
        assertCategoryReady({
          categoryId: subCategory.id,
          mainCategoryId: category.id,
          assignmentRules,
          jobFields,
          employees,
          scope: category.scope,
          tenantCompanyId,
          ownerCompanyId: OWNER_COMPANY_ID,
        });
      }
    }
  }
}

function assertCategoryReady(input: Parameters<typeof canActivateCategory>[0]) {
  if (canActivateCategory(input)) {
    return;
  }

  throw new ApiError("serviceDesk.categories.activationNotReady", 400, {
    categoryId: input.categoryId,
  });
}
