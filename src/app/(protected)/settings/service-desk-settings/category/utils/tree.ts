import type { TreeNodes } from "@/components/custom/dnd/tree/types";
import type {
  CategoryTreeSyncCategoryInput,
  SaveServiceDeskCategoryTreePayload,
} from "@/lib/application/contracts/serviceDesk";
import {
  normalizeLocalizedText,
  normalizeOptionalLocalizedText,
} from "@/shared/utils/value";

import type { CategoryData, SubCategoryData } from "../types";

type CategoryTree = TreeNodes<CategoryData | SubCategoryData>;

export const buildCategoryTreeSavePayload = ({
  tenantId,
  tree,
}: {
  tenantId: string;
  tree: CategoryTree;
}): SaveServiceDeskCategoryTreePayload => {
  return {
    tenantId,
    categories: tree.map((categoryNode, categoryIndex) => {
      const {
        isCreated: _categoryIsCreated,
        nodeType: _categoryNodeType,
        ...categoryData
      } = categoryNode.data as CategoryData;

      return {
        ...categoryData,
        name: normalizeLocalizedText(categoryData.name),
        description: normalizeOptionalLocalizedText(categoryData.description),
        requestTemplate: normalizeOptionalLocalizedText(
          categoryData.requestTemplate,
        ),
        index: categoryIndex + 1,
        subCategories: categoryNode.children.map(
          (subCategoryNode, subIndex) => {
            const {
              isCreated: _subCategoryIsCreated,
              nodeType: _subCategoryNodeType,
              ...subCategoryData
            } = subCategoryNode.data as SubCategoryData;

            return {
              ...subCategoryData,
              name: normalizeLocalizedText(subCategoryData.name),
              description: normalizeOptionalLocalizedText(
                subCategoryData.description,
              ),
              requestTemplate: normalizeOptionalLocalizedText(
                subCategoryData.requestTemplate,
              ),
              index: subIndex + 1,
            };
          },
        ),
      };
    }),
  };
};

const normalizeCategoriesForComparison = (
  categories: CategoryTreeSyncCategoryInput[],
) => {
  return categories.map((category, categoryIndex) => ({
    ...category,
    name: normalizeLocalizedText(category.name),
    description: normalizeOptionalLocalizedText(category.description),
    requestTemplate: normalizeOptionalLocalizedText(category.requestTemplate),
    index: categoryIndex + 1,
    subCategories: category.subCategories.map((subCategory, subIndex) => ({
      ...subCategory,
      name: normalizeLocalizedText(subCategory.name),
      description: normalizeOptionalLocalizedText(subCategory.description),
      requestTemplate: normalizeOptionalLocalizedText(
        subCategory.requestTemplate,
      ),
      index: subIndex + 1,
    })),
  }));
};

export const createCategorySettingsSignatureFromTree = (tree: CategoryTree) => {
  const payload = buildCategoryTreeSavePayload({
    tenantId: "comparison",
    tree,
  });

  return JSON.stringify(normalizeCategoriesForComparison(payload.categories));
};
