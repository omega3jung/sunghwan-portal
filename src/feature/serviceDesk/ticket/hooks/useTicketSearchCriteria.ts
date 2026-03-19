import { useMemo } from "react";
import { UseFormReturn } from "react-hook-form";

import { Category } from "@/domain/serviceDesk";

import { ListSearchArgType } from "../types";

interface Props {
  form: UseFormReturn<ListSearchArgType>;
  categories: Category[];
}

export const useTicketFilter = ({ form, categories }: Props) => {
  // Watch form state directly
  const selectedCategory = form.watch("category");

  // Category options
  const categoryOptions = useMemo(() => {
    return categories.map((c) => ({
      value: c.id.toString(),
      label: c.name,
    }));
  }, [categories]);

  // Subcategory options derived from the selected category
  const subCategoryOptions = useMemo(() => {
    if (!selectedCategory?.length) return [];

    return categories
      .filter((c) => selectedCategory.includes(c.id))
      .flatMap((c) =>
        c.subCategories.map((sub) => ({
          value: sub.id.toString(),
          label: sub.name,
        })),
      );
  }, [categories, selectedCategory]);

  return {
    categoryOptions,
    subCategoryOptions,
  };
};
