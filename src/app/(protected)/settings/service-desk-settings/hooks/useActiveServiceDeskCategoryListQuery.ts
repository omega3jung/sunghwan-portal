"use client";

import { useMemo } from "react";

import { useServiceDeskCategoryListQuery } from "@/feature/serviceDesk/category/client";

export function useActiveServiceDeskCategoryListQuery(
  selectedTenant: string | null,
) {
  const categoryParams = useMemo(
    () =>
      selectedTenant ? { tenantId: selectedTenant, active: true } : undefined,
    [selectedTenant],
  );

  return useServiceDeskCategoryListQuery(categoryParams);
}
