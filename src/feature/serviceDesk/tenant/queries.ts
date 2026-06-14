"use client";

import { useQuery } from "@tanstack/react-query";

import { useCurrentSession } from "@/feature/auth/session/client";
import { DbParams } from "@/shared/types/api";

import { getServiceDeskQueryOptions } from "../shared/utils/queryOptions";
import { serviceDeskTenantApi } from "./api";
import { tenantQueryKeys } from "./queryKeys";

export const useServiceDeskTenantListQuery = (params: DbParams) => {
  const { data: currentSession } = useCurrentSession();
  const dataScope = currentSession?.user.dataScope;
  const ticketQueryOptions = getServiceDeskQueryOptions(dataScope);

  return useQuery({
    queryKey: tenantQueryKeys.list(params),
    queryFn: () => serviceDeskTenantApi.list(params),
    enabled: !!params && !!dataScope,
    ...ticketQueryOptions,
  });
};
