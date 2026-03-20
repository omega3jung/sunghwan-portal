import { useState } from "react";

import type { TreeNodes } from "@/components/custom/dnd/tree/types";
import { setProperty } from "@/components/custom/dnd/tree/utilities";
import { SupportedLanguage } from "@/domain/config";
import { languageOptions } from "@/shared/constants";
import { Locale } from "@/shared/types";

import { CategoryData, MainCategoryData } from "../types";

type UseCategoryFormOptions = {
  selectedNode: CategoryData | MainCategoryData | null;
  language: SupportedLanguage;
  setTree: React.Dispatch<
    React.SetStateAction<TreeNodes<CategoryData | MainCategoryData>>
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
      data: CategoryData | MainCategoryData,
    ) => CategoryData | MainCategoryData,
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
    (key: keyof CategoryData | keyof MainCategoryData) => (value: any) => {
      updateNode((data) => ({
        ...data,
        [key]: value,
      }));
    };

  return {
    languageTab,
    setLanguageTab,
    languageOptions,
    updateTranslation,
    updateValue,
  };
};
