/** Returns the availability of a category in a new-ticket workflow. */
export function isCategoryEffectivelyActive(
  mainCategory: { active: boolean },
  subCategory?: { active: boolean } | null,
) {
  return mainCategory.active && (subCategory?.active ?? true);
}
