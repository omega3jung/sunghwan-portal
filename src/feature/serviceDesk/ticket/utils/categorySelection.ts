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

/** Describes the selected category, its parent, and requester guidance text. */
export type TicketCategoryMeta = {
  selected?: TicketCategoryNode;
  parentCategory?: MainCategory;
  path: TicketCategoryNode[];
};

/** Converts category records to parent-child picker items while preserving display order. */
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

/** Resolves ticket category meta from feature data using the current client policy. */
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

/** Formats ticket category path for presentation without changing the source model. */
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

/** Returns the parent category used to keep hierarchical picker state synchronized. */
export const getTicketCategoryParentId = (
  categories: MainCategory[],
  categoryId?: string | null,
) => {
  const meta = resolveTicketCategoryMeta(categories, categoryId);

  return meta.parentCategory?.id ?? meta.selected?.id;
};

/** Returns requester guidance inherited from the selected category path. */
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
