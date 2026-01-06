import fetcher from "@/services/fetcher";
import { DbParams, OResponse } from "@/types";

import { ApprovalStep } from "../types";

type ApprovalStepResponse = OResponse<ApprovalStep>;

export const fetchItServiceDeskApprovalStep = async (
  params: DbParams
): Promise<ApprovalStep[]> => {
  if (!params) return [];

  const res = await fetcher.api.get<ApprovalStepResponse>(
    "it-service-desk/category",
    { params }
  );

  return res.data.items;
};
