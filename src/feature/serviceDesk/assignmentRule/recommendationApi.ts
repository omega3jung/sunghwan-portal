import client from "@/lib/client/api";

import type {
  AssignmentRecommendationInput,
  AssignmentRecommendationResult,
} from "./recommendation";

export const serviceDeskAssignmentRecommendationApi = {
  recommend: async (
    data: AssignmentRecommendationInput,
  ): Promise<AssignmentRecommendationResult> => {
    const res = await client.api.post<AssignmentRecommendationResult>(
      "/api/service-desk/assignment-rules/recommendations",
      data,
    );

    return res.data;
  },
};
