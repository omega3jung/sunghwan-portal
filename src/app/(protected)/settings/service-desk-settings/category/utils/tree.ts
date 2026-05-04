import type { TreeNodes } from "@/components/custom/dnd/tree/types";
import type { MainCategory } from "@/domain/serviceDesk";
import type {
  CategoryTreeSyncCategoryInput,
  SaveServiceDeskCategoryTreePayload,
} from "@/feature/serviceDesk/category/types";
import type { LocalizedText } from "@/shared/types";

import type { CategoryData, SubCategoryData } from "../types";

type CategoryTree = TreeNodes<CategoryData | SubCategoryData>;

const normalizeLocalizedText = (value?: LocalizedText) => {
  return Object.fromEntries(
    Object.entries(value ?? {})
      .filter(([, text]) => typeof text === "string")
      .sort(([left], [right]) => left.localeCompare(right)),
  ) as LocalizedText;
};

const normalizeOptionalLocalizedText = (value?: LocalizedText) => {
  const normalizedValue = normalizeLocalizedText(value);

  return Object.keys(normalizedValue).length ? normalizedValue : undefined;
};

export const buildCategoryTreeSavePayload = ({
  clientId,
  tree,
}: {
  clientId: string;
  tree: CategoryTree;
}): SaveServiceDeskCategoryTreePayload => {
  return {
    clientId,
    categories: tree.map((categoryNode, categoryIndex) => {
      const { isCreated: _categoryIsCreated, ...categoryData } =
        categoryNode.data as CategoryData;

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
            const { isCreated: _subCategoryIsCreated, ...subCategoryData } =
              subCategoryNode.data as SubCategoryData;

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
  categories: Array<CategoryTreeSyncCategoryInput | MainCategory>,
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
    clientId: "comparison",
    tree,
  });

  return JSON.stringify(normalizeCategoriesForComparison(payload.categories));
};

export const createCategorySettingsSignatureFromCategories = (
  categories: MainCategory[],
) => {
  const normalizedCategories = categories
    .slice()
    .sort((left, right) => left.index - right.index)
    .map((category) => ({
      ...category,
      subCategories: category.subCategories
        .slice()
        .sort((left, right) => left.index - right.index),
    }));

  return JSON.stringify(normalizeCategoriesForComparison(normalizedCategories));
};
