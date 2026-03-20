import type { UniqueIdentifier } from "@dnd-kit/core";
import { useEffect, useMemo, useState } from "react";

import type { TreeNodes } from "@/components/custom/dnd/tree/types";
import {
  buildTree,
  flattenTree,
  removeItem,
} from "@/components/custom/dnd/tree/utilities";
import { ClientCategoryTree } from "@/domain/serviceDesk";

import {
  getDefaultCategoryData,
  getDefaultSubCategoryData,
} from "../constants";
import { CategoryData, MainCategoryData } from "../types";
import { categoryToTree, mapCategoryData } from "../util.mapper";

type UseCategoryTreeOptions = {
  selectedClient: string | null;
  categories: ClientCategoryTree[] | undefined;
};

export function useCategoryTree({
  selectedClient,
  categories,
}: UseCategoryTreeOptions) {
  const [tree, setTree] = useState<TreeNodes<CategoryData | MainCategoryData>>(
    [],
  );

  const [selectedId, setSelectedId] = useState<UniqueIdentifier | null>(null);

  const [newCategoryCount, setNewCategoryCount] = useState<number>(1);
  const [newSubCategoryCount, setNewSubCategoryCount] = useState<number>(1);

  useEffect(() => {
    if (!categories || !selectedClient) return;

    const mapped = mapCategoryData(categories, selectedClient);

    setTree(categoryToTree(mapped));
    setSelectedId(null); // reset selection when client changed.
  }, [categories, selectedClient]);

  const selectedNode = useMemo(() => {
    if (!selectedId) return null;

    const findNode = (
      nodes: TreeNodes<CategoryData | MainCategoryData>,
    ): CategoryData | MainCategoryData | null => {
      for (const node of nodes) {
        if (node.id === selectedId) return node.data;
        const found = findNode(node.children);
        if (found) return found;
      }
      return null;
    };

    return findNode(tree);
  }, [selectedId, tree]);

  const addCategory = () => {
    setTree((prev) => {
      const newCategory = categoryToTree([
        getDefaultCategoryData(newCategoryCount),
      ]);

      return [...newCategory, ...prev];
    });
    setNewCategoryCount(newCategoryCount + 1);
  };

  // 🔴 only for not saved category. existing category can not be deleted.
  const removeCategory = (id: UniqueIdentifier) => {
    setTree((prev) => {
      return removeItem(prev, id);
    });
    setSelectedId((prev) => (prev === id ? null : prev));
  };

  const addSubCategory = (parentId: UniqueIdentifier) => {
    setTree((prev) => {
      const flattened = flattenTree(prev);

      const parentIndex = flattened.findIndex((item) => item.id === parentId);
      if (parentIndex === -1) return prev;

      const newSubCategory = getDefaultSubCategoryData(newSubCategoryCount);

      const newNode = {
        id: newSubCategory.id,
        parentId,
        depth: 1,
        index: 0,
        data: newSubCategory,
        children: [],
      };

      // next of parent, first child.
      const insertIndex = parentIndex + 1;

      const next = [
        ...flattened.slice(0, insertIndex),
        newNode,
        ...flattened.slice(insertIndex),
      ];

      return buildTree(next);
    });

    setNewSubCategoryCount((c) => c + 1);
  };

  return {
    tree,
    setTree,
    selectedId,
    setSelectedId,
    selectedNode,
    addCategory,
    removeCategory,
    addSubCategory,
  };
}
