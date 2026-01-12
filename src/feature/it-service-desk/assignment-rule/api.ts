import { DbParams, OResponse } from "@/feature/query/types";
import fetcher from "@/services/fetcher";

import { AssignmentRule } from "../types";

type AssignmentRuleResponse = OResponse<AssignmentRule>;

export const fetchItServiceDeskAssignmentRule = async (
  params: DbParams
): Promise<AssignmentRule[]> => {
  if (!params) return [];

  const res = await fetcher.api.get<AssignmentRuleResponse>(
    "it-service-desk/category",
    { params }
  );

  return res.data.items;
};
