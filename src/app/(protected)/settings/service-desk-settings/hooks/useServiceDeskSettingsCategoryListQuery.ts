"use client";

import { useMemo } from "react";

import type { CategoryScope } from "@/domain/serviceDesk";
import { useServiceDeskCategoryListQuery } from "@/feature/serviceDesk/category/client";

export function useServiceDeskSettingsCategoryListQuery({
  tenantId,
  scope,
  enabled = true,
  active,
}: {
  tenantId: string | null;
  scope: CategoryScope;
  enabled?: boolean;
  active?: boolean;
}) {
  const params = useMemo(
    () =>
      tenantId && enabled
        ? {
            tenantId,
            ...(active === undefined ? {} : { active }),
            settings: true,
            context: "settings" as const,
            scope,
          }
        : undefined,
    [active, enabled, scope, tenantId],
  );

  return useServiceDeskCategoryListQuery(params);
}
