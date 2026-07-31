"use client";

import { useQuery } from "@tanstack/react-query";

import type { ServiceDeskTenantListParams } from "@/lib/application/contracts/serviceDesk";

import { useServiceDeskQueryOptions } from "../shared/hooks/useServiceDeskQueryOptions";
import { serviceDeskTenantApi } from "./api";
import { tenantQueryKeys } from "./queryKeys";

/** Provides the client query hook for service desk tenant list query and its cache policy. */
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
