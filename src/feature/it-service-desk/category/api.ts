import { DbParams, OResponse } from "@/feature/query/types";
import fetcher from "@/services/fetcher";

import { ClientCategoryTree } from "../types";

type CategoryResponse = OResponse<ClientCategoryTree>;

export const fetchItServiceDeskCategory = async (
  params: DbParams,
): Promise<ClientCategoryTree[]> => {
  if (!params) return [];

  const res = await fetcher.api.get<CategoryResponse>(
    "/api/it-service-desk/category",
    { params },
  );

  return res.data.items;
};
