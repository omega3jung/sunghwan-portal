"use client";

import { useMemo } from "react";

import type { CategoryScope } from "@/domain/serviceDesk";
import { useServiceDeskCategoryListQuery } from "@/feature/serviceDesk/category/client";

export function useActiveServiceDeskCategoryListQuery(
  selectedTenant: string | null,
  scope: CategoryScope,
  enabled = true,
) {
  const categoryParams = useMemo(
    () =>
      selectedTenant && enabled
        ? {
            tenantId: selectedTenant,
            active: true,
            settings: true,
            context: "settings" as const,
            scope,
          }
        : undefined,
    [enabled, scope, selectedTenant],
  );

  return useServiceDeskCategoryListQuery(categoryParams);
}
