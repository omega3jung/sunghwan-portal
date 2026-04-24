import {
  camelApprovalStepMapper,
  camelCategoryApprovalSettingMapper,
  type DbApprovalStep,
  type DbCategoryApprovalSettings,
} from "@/api/serviceDesk/approvalStep/mapper";
import type {
  CreateApprovalStepInput,
  UpdateApprovalStepInput,
} from "@/api/serviceDesk/approvalStep/write";
import type { DbClientCategoryTree } from "@/api/serviceDesk/category/mapper";
import { idToNumber } from "@/api/utils/mapId";
import {
  clientApprovalStepSettingsMock,
  internalApprovalStepSettingsMock,
} from "@/app/_mocks/domain/serviceDesk/approvalSteps";
import {
  clientCategorySettingsMock,
  internalCategorySettingsMock,
} from "@/app/_mocks/domain/serviceDesk/categories";
import { createIncrementalIdAssigner } from "@/app/api/_helpers";
import { createDualScopeLocalStore } from "@/app/api/service-desk/_shared/localStore";
import { ServiceDeskApiError } from "@/app/api/service-desk/_shared/messages";
import type {
  ApprovalStep,
  CategoryApprovalSettings,
} from "@/domain/serviceDesk";
import type { SaveServiceDeskApprovalStepTreePayload } from "@/feature/serviceDesk/approvalStep/types";

import { filterItemsByQuery } from "../../_helpers/filter";
import { getLocalCategoryTrees } from "../categories/localDemo";

type LocalDbApprovalStep = DbApprovalStep & {
  approval_step_active?: boolean;
};

type LocalDbCategoryApprovalSettings = Omit<
  DbCategoryApprovalSettings,
  "approval_step"
> & {
  approval_step: LocalDbApprovalStep[];
};

type ApprovalStepStore = Record<string, LocalDbCategoryApprovalSettings[]>;

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

const approvalStepStore = createDualScopeLocalStore<ApprovalStepStore>({
  internalSeed: buildApprovalStepSeed({
    categoryTrees: internalCategorySettingsMock,
    templateCategories: [
      ...internalApprovalStepSettingsMock,
      ...clientApprovalStepSettingsMock,
    ],
  }),
  clientSeed: buildApprovalStepSeed({
    categoryTrees: clientCategorySettingsMock,
    templateCategories: clientApprovalStepSettingsMock,
  }),
});

const getApprovalStepStore = (isInternal: boolean) => {
  const items = approvalStepStore.getStore(isInternal);
  const categoryTrees = getLocalCategoryTrees(isInternal);

  for (const client of categoryTrees) {
    const previousCategories = items[client.id] ?? [];
    const previousCategoryMap = new Map(
      previousCategories.map((category) => [String(category.category_id), category]),
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

const sortApprovalSteps = (approvalSteps: LocalDbApprovalStep[]) => {
  return approvalSteps
    .slice()
    .sort((left, right) => left.approval_step_index - right.approval_step_index);
};

const normalizeCategoryApprovalSettings = (
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

const normalizeApprovalStep = (approvalStep: LocalDbApprovalStep) => {
  return camelApprovalStepMapper([approvalStep])[0] ?? null;
};

const resolveClientId = (
  items: ApprovalStepStore,
  requestedClientId: string | null,
) => {
  if (requestedClientId && items[requestedClientId]) {
    return requestedClientId;
  }

  return Object.keys(items)[0] ?? null;
};

const getClientCategoriesOrThrow = (
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
      category.approval_step.map((approvalStep) => approvalStep.approval_step_id),
    ),
  );
};

const createApprovalStepIdAssigner = (items: ApprovalStepStore) => {
  const assignNextId = createIncrementalIdAssigner(collectApprovalStepIds(items));

  return (value?: string) => {
    const parsedId = value ? idToNumber(value) : null;

    if (parsedId !== null) {
      return parsedId;
    }

    return Number(assignNextId());
  };
};

const getCategoryLocationById = (items: ApprovalStepStore, categoryId: string) => {
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

const getApprovalStepLocation = (items: ApprovalStepStore, id: string) => {
  for (const [clientId, categories] of Object.entries(items)) {
    for (
      let categoryIndex = 0;
      categoryIndex < categories.length;
      categoryIndex += 1
    ) {
      const approvalStepIndex = categories[categoryIndex].approval_step.findIndex(
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

const toDbApprovalAssignee = (approvalStep: ApprovalStep["stepAssignee"]) => {
  switch (approvalStep.type) {
    case "MANAGER":
      return {
        type: approvalStep.type,
        level: approvalStep.level,
      } as const;
    case "DEPARTMENT":
      return {
        type: approvalStep.type,
        department_id: Number(approvalStep.departmentId),
      } as const;
    case "JOB_FIELD":
      return {
        type: approvalStep.type,
        field_id: Number(approvalStep.jobFieldId),
      } as const;
    case "EMPLOYEE":
      return {
        type: approvalStep.type,
        employee_id: approvalStep.employeeIds,
      } as const;
  }
};

const buildApprovalStepFromInput = ({
  input,
  assignId,
  previousApprovalStep,
}: {
  input:
    | CreateApprovalStepInput
    | UpdateApprovalStepInput
    | SaveServiceDeskApprovalStepTreePayload["categories"][number]["approvalSteps"][number];
  assignId: (value?: string) => number;
  previousApprovalStep?: LocalDbApprovalStep;
}) => {
  const resolvedId =
    previousApprovalStep?.approval_step_id ?? assignId(input.id);

  return {
    approval_step_id: resolvedId,
    approval_step_name: input.name,
    approval_step_description: input.description ?? null,
    approval_step_index: input.index,
    approval_step_active: true,
    category_id: Number("categoryId" in input ? input.categoryId : previousApprovalStep?.category_id),
    approval_step_assignee: toDbApprovalAssignee(input.stepAssignee),
    skip_access_level: input.skipAccessLevel ?? null,
  } satisfies LocalDbApprovalStep;
};

const createFallbackCategory = ({
  categoryId,
  index,
}: {
  categoryId: string;
  index: number;
}): LocalDbCategoryApprovalSettings => {
  const numericCategoryId = Number(categoryId);

  return {
    category_id: numericCategoryId,
    category_name: {
      en: `Category ${categoryId}`,
    },
    category_description: null,
    category_request_template: null,
    category_index: index,
    category_active: true,
    category_scope: "INTERNAL",
    default_priority: "medium",
    default_risk_level: "medium",
    default_sla_days: 3,
    approval_step: [],
  };
};

export const localListApprovalSteps = ({
  isInternal,
  searchParams,
}: {
  isInternal: boolean;
  searchParams: URLSearchParams;
}) => {
  const items = getApprovalStepStore(isInternal);
  const clientId = resolveClientId(items, searchParams.get("clientId"));
  const categories = clientId ? getClientCategoriesOrThrow(items, clientId) : [];
  const normalizedItems = normalizeCategoryApprovalSettings(categories);
  const filteredItems = filterItemsByQuery(searchParams, normalizedItems);

  return {
    items: filteredItems,
    total: filteredItems.length,
  };
};

export const localGetApprovalStep = ({
  isInternal,
  id,
}: {
  isInternal: boolean;
  id: string;
}) => {
  const items = getApprovalStepStore(isInternal);
  const location = getApprovalStepLocation(items, id);

  if (!location) {
    return null;
  }

  const approvalStep =
    items[location.clientId][location.categoryIndex].approval_step[
      location.approvalStepIndex
    ];

  if (approvalStep.approval_step_active === false) {
    return null;
  }

  return normalizeApprovalStep(approvalStep);
};

export const localCreateApprovalStep = ({
  isInternal,
  input,
}: {
  isInternal: boolean;
  input: CreateApprovalStepInput;
}) => {
  const items = getApprovalStepStore(isInternal);
  const categoryLocation = getCategoryLocationById(items, input.categoryId);

  if (!categoryLocation) {
    throw new ServiceDeskApiError(
      "api.approvalSteps.localDemo.categoryNotFound",
      404,
      { categoryId: input.categoryId },
    );
  }

  const categories = items[categoryLocation.clientId];
  const assignId = createApprovalStepIdAssigner(items);
  const nextApprovalStep = buildApprovalStepFromInput({
    input,
    assignId,
  });

  categories[categoryLocation.categoryIndex].approval_step.push(nextApprovalStep);
  categories[categoryLocation.categoryIndex].approval_step = sortApprovalSteps(
    categories[categoryLocation.categoryIndex].approval_step,
  );

  return normalizeApprovalStep(nextApprovalStep);
};

export const localUpdateApprovalStep = ({
  isInternal,
  id,
  input,
}: {
  isInternal: boolean;
  id: string;
  input: UpdateApprovalStepInput;
}) => {
  const items = getApprovalStepStore(isInternal);
  const approvalStepLocation = getApprovalStepLocation(items, id);

  if (!approvalStepLocation) {
    throw new ServiceDeskApiError("api.common.notFound", 404);
  }

  const targetCategoryLocation = getCategoryLocationById(items, input.categoryId);

  if (!targetCategoryLocation) {
    throw new ServiceDeskApiError(
      "api.approvalSteps.localDemo.categoryNotFound",
      404,
      { categoryId: input.categoryId },
    );
  }

  const assignId = createApprovalStepIdAssigner(items);
  const previousApprovalStep =
    items[approvalStepLocation.clientId][approvalStepLocation.categoryIndex]
      .approval_step[approvalStepLocation.approvalStepIndex];
  const nextApprovalStep = buildApprovalStepFromInput({
    input: {
      ...input,
      id,
    },
    assignId,
    previousApprovalStep,
  });

  items[approvalStepLocation.clientId][approvalStepLocation.categoryIndex].approval_step.splice(
    approvalStepLocation.approvalStepIndex,
    1,
  );
  items[targetCategoryLocation.clientId][targetCategoryLocation.categoryIndex].approval_step.push(
    nextApprovalStep,
  );
  items[targetCategoryLocation.clientId][targetCategoryLocation.categoryIndex].approval_step =
    sortApprovalSteps(
      items[targetCategoryLocation.clientId][targetCategoryLocation.categoryIndex]
        .approval_step,
    );

  return normalizeApprovalStep(nextApprovalStep);
};

export const localSaveApprovalStepTree = ({
  isInternal,
  payload,
}: {
  isInternal: boolean;
  payload: SaveServiceDeskApprovalStepTreePayload;
}) => {
  const items = getApprovalStepStore(isInternal);
  const categories = getClientCategoriesOrThrow(items, payload.clientId);
  const previousCategoryMap = new Map(
    categories.map((category) => [String(category.category_id), category]),
  );
  const assignId = createApprovalStepIdAssigner(items);

  const synchronizedCategories = payload.categories.map((category, categoryIndex) => {
    const previousCategory =
      previousCategoryMap.get(category.id) ??
      createFallbackCategory({
        categoryId: category.id,
        index: categoryIndex + 1,
      });

    const previousApprovalStepMap = new Map(
      previousCategory.approval_step.map((approvalStep) => [
        String(approvalStep.approval_step_id),
        approvalStep,
      ]),
    );
    const nextApprovalSteps = category.approvalSteps.map((approvalStep, index) =>
      buildApprovalStepFromInput({
        input: {
          ...approvalStep,
          index: index + 1,
          categoryId: category.id,
        },
        assignId,
        previousApprovalStep: approvalStep.id
          ? previousApprovalStepMap.get(approvalStep.id)
          : undefined,
      }),
    );
    const submittedIds = new Set(
      nextApprovalSteps.map((approvalStep) =>
        String(approvalStep.approval_step_id),
      ),
    );
    const deactivatedApprovalSteps = previousCategory.approval_step
      .filter(
        (approvalStep) =>
          !submittedIds.has(String(approvalStep.approval_step_id)) &&
          approvalStep.approval_step_active !== false,
      )
      .map((approvalStep) => ({
        ...approvalStep,
        approval_step_active: false,
      }));
    const preservedInactiveApprovalSteps = previousCategory.approval_step.filter(
      (approvalStep) =>
        !submittedIds.has(String(approvalStep.approval_step_id)) &&
        approvalStep.approval_step_active === false,
    );

    return {
      ...previousCategory,
      approval_step: [
        ...nextApprovalSteps,
        ...deactivatedApprovalSteps,
        ...preservedInactiveApprovalSteps,
      ],
    } satisfies LocalDbCategoryApprovalSettings;
  });

  const submittedCategoryIds = new Set(
    synchronizedCategories.map((category) => String(category.category_id)),
  );
  const preservedCategories = categories.filter(
    (category) => !submittedCategoryIds.has(String(category.category_id)),
  );

  items[payload.clientId] = [...synchronizedCategories, ...preservedCategories];

  return normalizeCategoryApprovalSettings(items[payload.clientId]);
};

export const localSoftDeleteApprovalStep = ({
  isInternal,
  id,
}: {
  isInternal: boolean;
  id: string;
}) => {
  const items = getApprovalStepStore(isInternal);
  const location = getApprovalStepLocation(items, id);

  if (!location) {
    throw new ServiceDeskApiError("api.common.notFound", 404);
  }

  const previousApprovalStep =
    items[location.clientId][location.categoryIndex].approval_step[
      location.approvalStepIndex
    ];
  const nextApprovalStep = {
    ...previousApprovalStep,
    approval_step_active: false,
  };

  items[location.clientId][location.categoryIndex].approval_step.splice(
    location.approvalStepIndex,
    1,
    nextApprovalStep,
  );

  return new Response(null, { status: 204 });
};
