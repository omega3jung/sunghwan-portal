import { DbParams, OResponse } from "@/feature/query/types";
import fetcher from "@/services/fetcher";

import { ApprovalStep } from "../types";

type ApprovalStepResponse = OResponse<ApprovalStep>;

export const fetchItServiceDeskApprovalStep = async (
  params: DbParams,
): Promise<ApprovalStep[]> => {
  if (!params) return [];

  const res = await fetcher.api.get<ApprovalStepResponse>(
    "/api/it-service-desk/category",
    { params },
  );

  return res.data.items;
};
