import type {
  AssignmentRecommendationInput,
  AssignmentRecommendationResult,
} from "@/lib/application/contracts/serviceDesk";
import client from "@/lib/client/api";

/** Requests assignment recommendations for a category and current assignee selection. */
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
