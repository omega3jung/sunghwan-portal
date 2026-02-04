import { useQuery } from "@tanstack/react-query";

import { STATIC_QUERY_OPTIONS } from "@/feature/query/constants";
import { DbParams } from "@/feature/query/types";

import { fetchItServiceDeskCategory } from "./api";
import { categoryQueryKeys } from "./queryKeys";

export const useFetchItServiceDeskCategory = (params: DbParams) => {
  return useQuery({
    queryKey: categoryQueryKeys.list(params),
    queryFn: () => fetchItServiceDeskCategory(params),
    select: (data) => [...data],
    ...STATIC_QUERY_OPTIONS,
  });
};
