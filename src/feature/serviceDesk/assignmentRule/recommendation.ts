import client from "@/lib/api";
import type { ImageValueLabel, Locale } from "@/shared/types";

export type AssignmentRecommendationSource = "employee" | "jobField" | "mixed";

export type AssignmentRecommendationInput = {
  categoryId: string;
  assigneeUsernames: string[];
  language?: Locale;
};

export type AssignmentRecommendationResult = {
  recommendedUsers: ImageValueLabel[];
  source: AssignmentRecommendationSource | null;
  selectedCategoryLabel: string;
};

export const EMPTY_ASSIGNMENT_RECOMMENDATION: AssignmentRecommendationResult = {
  recommendedUsers: [],
  source: null,
  selectedCategoryLabel: "",
};

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
