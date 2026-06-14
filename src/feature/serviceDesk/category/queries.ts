"use client";

import { useQuery } from "@tanstack/react-query";

import { useCurrentSession } from "@/feature/auth/session/client";
import { DbParams } from "@/shared/types/api";

import { getServiceDeskQueryOptions } from "../shared/utils/queryOptions";
import { serviceDeskCategoryApi } from "./api";
import { categoryQueryKeys } from "./queryKeys";

export const useServiceDeskCategoryListQuery = (params: DbParams) => {
  const { data: currentSession } = useCurrentSession();
  const dataScope = currentSession?.user.dataScope;
  const ticketQueryOptions = getServiceDeskQueryOptions(dataScope);

  return useQuery({
    queryKey: categoryQueryKeys.list(params),
    queryFn: () => serviceDeskCategoryApi.list(params),
    enabled: !!params && !!dataScope,
    ...ticketQueryOptions,
  });
};
