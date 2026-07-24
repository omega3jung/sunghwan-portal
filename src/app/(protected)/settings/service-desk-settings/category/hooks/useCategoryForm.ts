import { useState } from "react";

import type { TreeNodes } from "@/components/custom/dnd/tree/types";
import { setProperty } from "@/components/custom/dnd/tree/utilities";
import { SupportedLanguage } from "@/lib/application/i18n";
import { Locale } from "@/shared/types";

import { CategoryData, SubCategoryData } from "../types";

type UseCategoryFormOptions = {
  selectedNode: CategoryData | SubCategoryData | null;
  language: SupportedLanguage;
  setTree: React.Dispatch<
    React.SetStateAction<TreeNodes<CategoryData | SubCategoryData>>
  >;
};

export const useCategoryForm = ({
  selectedNode,
  language,
  setTree,
}: UseCategoryFormOptions) => {
  const [languageTab, setLanguageTab] = useState<Locale>(language);

  const updateNode = (
    updater: (
      data: CategoryData | SubCategoryData,
    ) => CategoryData | SubCategoryData,
  ) => {
    if (!selectedNode) return;

    setTree((prev) =>
      setProperty(prev, selectedNode.id, "data", (data) => {
        const updated = updater(data);

        return updated;
      }),
    );
  };

  const updateTranslation =
    (key: "name" | "description" | "requestTemplate") => (value: string) => {
      updateNode((data) => ({
        ...data,
        [key]: {
          ...data[key],
          [languageTab]: value,
        },
      }));
    };

  const updateValue =
    (key: keyof CategoryData | keyof SubCategoryData) => (value: any) => {
      updateNode((data) => ({
        ...data,
        [key]: value,
      }));
    };

  return {
    languageTab,
    setLanguageTab,
    updateTranslation,
    updateValue,
  };
};
