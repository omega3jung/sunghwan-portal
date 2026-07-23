import { filterItemsByQuery } from "@/lib/application/api/query";

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
  const scope = searchParams.get("scope");
  const scopedItems =
    scope === "INTERNAL" || scope === "PORTAL"
      ? normalizedItems.filter((category) => category.scope === scope)
      : normalizedItems;
  const filteredItems = filterItemsByQuery(searchParams, scopedItems);

  return {
    items: filteredItems,
    total: filteredItems.length,
  };
};
