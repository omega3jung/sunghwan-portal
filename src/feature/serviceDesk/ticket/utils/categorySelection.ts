import type { HierarchicalSelectItem } from "@/components/custom/HierarchicalSelect";
import type { Priority, RiskLevel } from "@/domain/common";
import type { MainCategory } from "@/domain/serviceDesk";
import type { LocalizedText } from "@/shared/types";

type LocalizeText = (text: LocalizedText) => string;

type TicketCategoryNode = {
  id: string;
  name: LocalizedText;
  requestTemplate?: LocalizedText;
  defaultPriority?: Priority | null;
  defaultRiskLevel?: RiskLevel | null;
  defaultSlaDays?: number;
};

export type TicketCategoryMeta = {
  selected?: TicketCategoryNode;
  parentCategory?: MainCategory;
  path: TicketCategoryNode[];
};

export const mapTicketCategoriesToHierarchicalItems = (
  categories: MainCategory[],
  localizeText: LocalizeText,
): HierarchicalSelectItem[] =>
  categories
    .filter((category) => category.active)
    .map((category) => {
      const children = category.subCategories
        .filter((subCategory) => subCategory.active)
        .map(
          (subCategory): HierarchicalSelectItem => ({
            value: subCategory.id,
            label: localizeText(subCategory.name),
          }),
        );

      return {
        value: category.id,
        label: localizeText(category.name),
        ...(children.length > 0 ? { children } : {}),
      };
    });

export const resolveTicketCategoryMeta = (
  categories: MainCategory[],
  categoryId?: string | null,
): TicketCategoryMeta => {
  if (!categoryId) {
    return { path: [] };
  }

  for (const category of categories) {
    if (category.id === categoryId) {
      return {
        selected: category,
        path: [category],
      };
    }

    const subCategory = category.subCategories.find(
      (item) => item.id === categoryId,
    );

    if (subCategory) {
      return {
        selected: subCategory,
        parentCategory: category,
        path: [category, subCategory],
      };
    }
  }

  return { path: [] };
};

export const formatTicketCategoryPath = (
  meta: TicketCategoryMeta,
  localizeText: LocalizeText,
  fallback = "-",
) => {
  if (meta.path.length === 0) {
    return fallback;
  }

  return meta.path.map((item) => localizeText(item.name)).join(" / ");
};

export const getTicketCategoryParentId = (
  categories: MainCategory[],
  categoryId?: string | null,
) => {
  const meta = resolveTicketCategoryMeta(categories, categoryId);

  return meta.parentCategory?.id ?? meta.selected?.id;
};

export const getTicketCategoryRequestTemplate = (
  categories: MainCategory[],
  categoryId: string | undefined,
  localizeText: LocalizeText,
) => {
  const { selected, parentCategory } = resolveTicketCategoryMeta(
    categories,
    categoryId,
  );
  const requestTemplate =
    selected?.requestTemplate ?? parentCategory?.requestTemplate;

  return requestTemplate ? localizeText(requestTemplate) : "";
};
