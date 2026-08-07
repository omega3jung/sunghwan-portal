import type { ImageValueLabel, Locale } from "@/shared/types";

/** Represents assignment recommendation source within the Service Desk application boundary. */
export type AssignmentRecommendationSource = "employee" | "jobField" | "mixed";

/** Input contract for assignment recommendation operations at the Service Desk application boundary. */
export type AssignmentRecommendationInput = {
  categoryId: string;
  assigneeUsernames: string[];
  language?: Locale;
};

/** Represents assignment recommendation result within the Service Desk application boundary. */
export type AssignmentRecommendationResult = {
  recommendedUsers: ImageValueLabel[];
  source: AssignmentRecommendationSource | null;
  selectedCategoryLabel: string;
};

/** Defines the empty assignment recommendation policy value used by the Service Desk application boundary. */
export const EMPTY_ASSIGNMENT_RECOMMENDATION: AssignmentRecommendationResult = {
  recommendedUsers: [],
  source: null,
  selectedCategoryLabel: "",
};
