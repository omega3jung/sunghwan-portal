import { DbParams, OResponse } from "@/feature/query/types";
import fetcher from "@/services/fetcher";

import { FullCategories } from "../types";

type CategoryResponse = OResponse<FullCategories>;

export const fetchItServiceDeskCategory = async (
  params: DbParams,
): Promise<FullCategories[]> => {
  if (!params) return [];

  const res = await fetcher.api.get<CategoryResponse>(
    "/api/it-service-desk/category",
    { params },
  );

  return res.data.items;
};
