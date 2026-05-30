import { filterItemsByQuery } from "@/app/api/_helpers/filter";

import {
  getApprovalStepLocation,
  getApprovalStepStore,
  getClientCategoriesOrThrow,
  normalizeApprovalStep,
  normalizeCategoryApprovalSettings,
  resolveClientId,
} from "./approvalStepUtils";

export const localListApprovalSteps = ({
  isInternal,
  searchParams,
}: {
  isInternal: boolean;
  searchParams: URLSearchParams;
}) => {
  const items = getApprovalStepStore(isInternal);
  const clientId = resolveClientId(items, searchParams.get("clientId"));
  const categories = clientId
    ? getClientCategoriesOrThrow(items, clientId)
    : [];
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
