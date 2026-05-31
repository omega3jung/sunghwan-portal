import { createIncrementalIdAssigner } from "@/app/api/_helpers";
import { ServiceDeskApiError } from "@/app/api/service-desk/_shared/messages";
import type { CategoryApprovalSettings } from "@/domain/serviceDesk";
import {
  camelApprovalStepMapper,
  camelCategoryApprovalSettingMapper,
  type DbApprovalStep,
  type DbCategoryApprovalSettings,
} from "@/feature/serviceDesk/approvalStep/mapper";
import type { DbClientCategoryTree } from "@/feature/serviceDesk/category/mapper";
import { idToNumber } from "@/lib/api/utils/mapId";
import { getLocalCategoryTrees } from "@/server/serviceDesk/settings/category/localDemo";

import { getLocalDemoApprovalStepsTree } from "../../state";

export type LocalDbApprovalStep = DbApprovalStep & {
  approval_step_active?: boolean;
};

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

const toActiveApprovalStep = (
  approvalStep: DbApprovalStep,
): LocalDbApprovalStep => ({
  ...approvalStep,
  approval_step_active: approvalStep.approval_step_active ?? true,
});

const buildApprovalStepSeed = ({
  categoryTrees,
  templateCategories,
}: {
  categoryTrees: DbClientCategoryTree[];
  templateCategories: DbCategoryApprovalSettings[];
}): ApprovalStepStore => {
  const templateMap = new Map(
    templateCategories.map((category) => [
      String(category.category_id),
      category.approval_step.map(toActiveApprovalStep),
    ]),
  );

  return Object.fromEntries(
    categoryTrees.map((client) => [
      String(client.client_id),
      client.category.map((category) => ({
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

  for (const client of categoryTrees) {
    const previousCategories = items[client.id] ?? [];
    const previousCategoryMap = new Map(
      previousCategories.map((category) => [
        String(category.category_id),
        category,
      ]),
    );
    const synchronizedCategories = client.categories.map((category) => ({
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

    items[client.id] = [...synchronizedCategories, ...preservedCategories].sort(
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

export const resolveClientId = (
  items: ApprovalStepStore,
  requestedClientId: string | null,
) => {
  if (requestedClientId && items[requestedClientId]) {
    return requestedClientId;
  }

  return Object.keys(items)[0] ?? null;
};

export const getClientCategoriesOrThrow = (
  items: ApprovalStepStore,
  clientId: string,
) => {
  const categories = items[clientId];

  if (!categories) {
    throw new ServiceDeskApiError(
      "api.approvalSteps.localDemo.clientNotFound",
      404,
      { clientId },
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
  for (const [clientId, categories] of Object.entries(items)) {
    const categoryIndex = categories.findIndex(
      (category) => String(category.category_id) === categoryId,
    );

    if (categoryIndex >= 0) {
      return {
        clientId,
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
  for (const [clientId, categories] of Object.entries(items)) {
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
          clientId,
          categoryIndex,
          approvalStepIndex,
        };
      }
    }
  }

  return null;
};
