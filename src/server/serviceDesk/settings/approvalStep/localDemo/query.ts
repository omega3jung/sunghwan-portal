import { filterItemsByQuery } from "@/app/api/_helpers/filter";

import {
  getApprovalStepLocation,
  getApprovalStepStore,
  getTenantCategoriesOrThrow,
  normalizeApprovalStep,
  normalizeCategoryApprovalSettings,
  resolveTenantId,
} from "./approvalStepUtils";

export const localListApprovalSteps = ({
  isInternal,
  searchParams,
}: {
  isInternal: boolean;
  searchParams: URLSearchParams;
}) => {
  const items = getApprovalStepStore(isInternal);
  const tenantId = resolveTenantId(items, searchParams.get("tenantId"));
  const categories = tenantId
    ? getTenantCategoriesOrThrow(items, tenantId)
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
    items[location.tenantId][location.categoryIndex].approval_step[
      location.approvalStepIndex
    ];

  return normalizeApprovalStep(approvalStep);
};
