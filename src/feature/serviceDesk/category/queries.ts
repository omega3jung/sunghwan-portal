"use client";

import { useQuery } from "@tanstack/react-query";

import { useCurrentSession } from "@/feature/auth/session/client";
import { serviceDeskCategoryApi } from "@/feature/serviceDesk/category";
import { DbParams } from "@/shared/types/api";

import { getServiceDeskQueryOptions } from "../shared/utils/queryOptions";
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

export const useServiceDeskCategoryQuery = (id: string | number) => {
  const { data: currentSession } = useCurrentSession();
  const dataScope = currentSession?.user.dataScope;
  const ticketQueryOptions = getServiceDeskQueryOptions(dataScope);

  return useQuery({
    queryKey: categoryQueryKeys.detail(id),
    queryFn: () => serviceDeskCategoryApi.get(id),
    enabled: !!id && !!dataScope,
    ...ticketQueryOptions,
  });
};
