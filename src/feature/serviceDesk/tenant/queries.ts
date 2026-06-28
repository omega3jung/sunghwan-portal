"use client";

import { useQuery } from "@tanstack/react-query";

import { DbParams } from "@/shared/types/api";

import { useServiceDeskQueryOptions } from "../shared/hooks/useServiceDeskQueryOptions";
import { serviceDeskTenantApi } from "./api";
import { tenantQueryKeys } from "./queryKeys";

export const useServiceDeskTenantListQuery = (params: DbParams) => {
  const { dataScope, queryOptions } = useServiceDeskQueryOptions();

  return useQuery({
    queryKey: tenantQueryKeys.list(params),
    queryFn: () => serviceDeskTenantApi.list(params),
    enabled: !!params && !!dataScope,
    ...queryOptions,
  });
};
