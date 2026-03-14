import { useMemo } from "react";
import { UseFormReturn } from "react-hook-form";

import { Category } from "@/domain/serviceDesk";

import { ListSearchArgType } from "../types";

interface Props {
  form: UseFormReturn<ListSearchArgType>;
  categories: Category[];
}

export const useTicketFilter = ({ form, categories }: Props) => {
  // form 상태 직접 watch
  const selectedCategory = form.watch("category");

  // category 옵션
  const categoryOptions = useMemo(() => {
    return categories.map((c) => ({
      value: c.id.toString(),
      label: c.name,
    }));
  }, [categories]);

  // subCategory 옵션 (category 기반 파생)
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
