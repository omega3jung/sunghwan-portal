"use client";

import { useQuery } from "@tanstack/react-query";

import { useServiceDeskQueryOptions } from "../shared/hooks/useServiceDeskQueryOptions";
import { serviceDeskTenantApi } from "./api";
import { tenantQueryKeys } from "./queryKeys";
import type { ServiceDeskTenantListParams } from "./types";

export const useServiceDeskTenantListQuery = (
  params: ServiceDeskTenantListParams,
) => {
  const { dataScope, queryOptions } = useServiceDeskQueryOptions();

  return useQuery({
    queryKey: tenantQueryKeys.list(params),
    queryFn: () => serviceDeskTenantApi.list(params),
    enabled: !!params && !!dataScope,
    ...queryOptions,
  });
};
