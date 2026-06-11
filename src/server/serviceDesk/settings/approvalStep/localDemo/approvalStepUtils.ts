import { createIncrementalIdAssigner } from "@/app/api/_helpers";
import { ServiceDeskApiError } from "@/app/api/service-desk/_shared/messages";
import type { CategoryApprovalSettings } from "@/domain/serviceDesk";
import {
  type DbApprovalStep,
  type DbCategoryApprovalSettings,
} from "@/feature/serviceDesk/approvalStep";
import {
  camelApprovalStepMapper,
  camelCategoryApprovalSettingMapper,
} from "@/feature/serviceDesk/approvalStep/mapper";
import type { DbTenantCategoryTree } from "@/feature/serviceDesk/category";
import { idToNumber } from "@/lib/api/utils/mapId";
import { getLocalCategoryTrees } from "@/server/serviceDesk/settings/category/localDemo";

import { getLocalDemoApprovalStepsTree } from "../../state";

export type LocalDbApprovalStep = DbApprovalStep;

export type LocalDbCategoryApprovalSettings = Omit<
  DbCategoryApprovalSettings,
  "approval_step"
> & {
  approval_step: LocalDbApprovalStep[];
};

export type ApprovalStepStore = Record<
  string,
  LocalDbCategoryApprovalSettings[]
>;

const buildApprovalStepSeed = ({
  categoryTrees,
  templateCategories,
}: {
  categoryTrees: DbTenantCategoryTree[];
  templateCategories: DbCategoryApprovalSettings[];
}): ApprovalStepStore => {
  const templateMap = new Map(
    templateCategories.map((category) => [
      String(category.category_id),
      category.approval_step,
    ]),
  );

  return Object.fromEntries(
    categoryTrees.map((tenant) => [
      String(tenant.tenant_id),
      tenant.category.map((category) => ({
        category_id: category.category_id,
        category_name: category.category_name,
        category_description: category.category_description,
        category_request_template: category.category_request_template,
        category_index: category.category_index,
        category_active: category.category_active,
        category_scope: category.category_scope,
        default_priority: category.default_priority,
        default_risk_level: category.default_risk_level,
        default_sla_days: category.default_sla_days,
        approval_step: (
          templateMap.get(String(category.category_id)) ?? []
        ).map((approvalStep) => ({
          ...approvalStep,
          category_id: category.category_id,
        })),
      })),
    ]),
  );
};

export const getApprovalStepStore = (isInternal: boolean) => {
  const items = buildApprovalStepSeed(
    getLocalDemoApprovalStepsTree(isInternal),
  );
  const categoryTrees = getLocalCategoryTrees(isInternal);

  for (const tenant of categoryTrees) {
    const previousCategories = items[tenant.id] ?? [];
    const previousCategoryMap = new Map(
      previousCategories.map((category) => [
        String(category.category_id),
        category,
      ]),
    );
    const synchronizedCategories = tenant.categories.map((category) => ({
      category_id: Number(category.id),
      category_name: category.name,
      category_description: category.description ?? null,
      category_request_template: category.requestTemplate ?? null,
      category_index: category.index,
      category_active: category.active,
      category_scope: category.scope,
      default_priority: category.defaultPriority,
      default_risk_level: category.defaultRiskLevel,
      default_sla_days: category.defaultSlaDays,
      approval_step: previousCategoryMap.get(category.id)?.approval_step ?? [],
    }));
    const knownCategoryIds = new Set(
      synchronizedCategories.map((category) => String(category.category_id)),
    );
    const preservedCategories = previousCategories.filter(
      (category) => !knownCategoryIds.has(String(category.category_id)),
    );

    items[tenant.id] = [...synchronizedCategories, ...preservedCategories].sort(
      (left, right) => left.category_index - right.category_index,
    );
  }

  return items;
};

export const sortApprovalSteps = (approvalSteps: LocalDbApprovalStep[]) => {
  return approvalSteps
    .slice()
    .sort(
      (left, right) => left.approval_step_index - right.approval_step_index,
    );
};

export const normalizeCategoryApprovalSettings = (
  categories: LocalDbCategoryApprovalSettings[],
): CategoryApprovalSettings[] => {
  return camelCategoryApprovalSettingMapper(
    categories
      .slice()
      .sort((left, right) => left.category_index - right.category_index)
      .map((category) => ({
        ...category,
        approval_step: sortApprovalSteps(category.approval_step),
      })),
  );
};

export const normalizeApprovalStep = (approvalStep: LocalDbApprovalStep) => {
  return camelApprovalStepMapper([approvalStep])[0] ?? null;
};

export const resolveTenantId = (
  items: ApprovalStepStore,
  requestedTenantId: string | null,
) => {
  if (requestedTenantId && items[requestedTenantId]) {
    return requestedTenantId;
  }

  return Object.keys(items)[0] ?? null;
};

export const getTenantCategoriesOrThrow = (
  items: ApprovalStepStore,
  tenantId: string,
) => {
  const categories = items[tenantId];

  if (!categories) {
    throw new ServiceDeskApiError(
      "api.approvalSteps.localDemo.tenantNotFound",
      404,
      { tenantId },
    );
  }

  return categories;
};

const collectApprovalStepIds = (items: ApprovalStepStore) => {
  return Object.values(items).flatMap((categories) =>
    categories.flatMap((category) =>
      category.approval_step.map(
        (approvalStep) => approvalStep.approval_step_id,
      ),
    ),
  );
};

export const createApprovalStepIdAssigner = (items: ApprovalStepStore) => {
  const assignNextId = createIncrementalIdAssigner(
    collectApprovalStepIds(items),
  );

  return (value?: string) => {
    const parsedId = value ? idToNumber(value) : null;

    if (parsedId !== null) {
      return parsedId;
    }

    return Number(assignNextId());
  };
};

export const getCategoryLocationById = (
  items: ApprovalStepStore,
  categoryId: string,
) => {
  for (const [tenantId, categories] of Object.entries(items)) {
    const categoryIndex = categories.findIndex(
      (category) => String(category.category_id) === categoryId,
    );

    if (categoryIndex >= 0) {
      return {
        tenantId,
        categoryIndex,
      };
    }
  }

  return null;
};

export const getApprovalStepLocation = (
  items: ApprovalStepStore,
  id: string,
) => {
  for (const [tenantId, categories] of Object.entries(items)) {
    for (
      let categoryIndex = 0;
      categoryIndex < categories.length;
      categoryIndex += 1
    ) {
      const approvalStepIndex = categories[
        categoryIndex
      ].approval_step.findIndex(
        (approvalStep) => String(approvalStep.approval_step_id) === id,
      );

      if (approvalStepIndex >= 0) {
        return {
          tenantId,
          categoryIndex,
          approvalStepIndex,
        };
      }
    }
  }

  return null;
};
