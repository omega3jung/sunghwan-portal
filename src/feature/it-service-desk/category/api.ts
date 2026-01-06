import fetcher from "@/services/fetcher";
import { DbParams, OResponse } from "@/types";

import { Category } from "../types";

type CategoryResponse = OResponse<Category>;

export const fetchItServiceDeskCategory = async (
  params: DbParams
): Promise<Category[]> => {
  if (!params) return [];

  const res = await fetcher.api.get<CategoryResponse>(
    "it-service-desk/category",
    { params }
  );

  return res.data.items;
};
