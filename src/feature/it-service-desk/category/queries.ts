import { useQuery } from "@tanstack/react-query";

import { DbParams } from "@/types";

import { fetchItServiceDeskCategory } from "./api";
import { categoryQueryKeys } from "./queryKeys";

export const useFetchItServiceDeskCategory = (params: DbParams) => {
  return useQuery({
    queryKey: categoryQueryKeys.list(params),
    queryFn: () => fetchItServiceDeskCategory(params),
    enabled: true,
    staleTime: 60_000,
  });
};
