import { filterItemsByQuery } from "@/app/api/_helpers/filter";

import {
  getApprovalStepStore,
  getTenantCategoriesOrThrow,
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
