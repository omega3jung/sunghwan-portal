import type { UniqueIdentifier } from "@dnd-kit/core";
import { useEffect, useMemo, useRef, useState } from "react";

import type { TreeNodes } from "@/components/custom/dnd/tree/types";
import {
  buildTree,
  findTreeNodeData,
  findTreeNodePath,
  flattenTree,
  removeItem,
  resolveTreeNodeIdByPath,
  TreeNodePath,
} from "@/components/custom/dnd/tree/utilities";
import type { ClientCategoryTree } from "@/domain/serviceDesk";

import {
  getDefaultCategoryData,
  getDefaultSubCategoryData,
} from "../constants";
import { CategoryData, SubCategoryData } from "../types";
import { categoryToTree, mapCategoryData } from "../utils/mapper";

type UseCategoryTreeOptions = {
  selectedClient: string | null;
  categories: ClientCategoryTree[] | undefined;
};

export function useCategoryTree({
  selectedClient,
  categories,
}: UseCategoryTreeOptions) {
  const [tree, setTree] = useState<TreeNodes<CategoryData | SubCategoryData>>(
    [],
  );

  const [selectedId, setSelectedId] = useState<UniqueIdentifier | null>(null);
  const [treeClientId, setTreeClientId] = useState<string | null>(null);

  const [newCategoryCount, setNewCategoryCount] = useState<number>(1);
  const [newSubCategoryCount, setNewSubCategoryCount] = useState<number>(1);
  const previousClientRef = useRef<string | null>(null);
  const selectedPathRef = useRef<TreeNodePath | null>(null);

  useEffect(() => {
    selectedPathRef.current = findTreeNodePath(tree, selectedId);
  }, [selectedId, tree]);

  useEffect(() => {
    if (!categories || !selectedClient) return;

    const mapped = mapCategoryData(categories, selectedClient);
    const nextTree = categoryToTree(mapped);

    setTree(nextTree);
    setTreeClientId(selectedClient);
    setSelectedId((previousSelectedId) => {
      if (previousClientRef.current !== selectedClient) {
        previousClientRef.current = selectedClient;
        return null;
      }

      if (!previousSelectedId) {
        return null;
      }

      const matchingCategory = nextTree.find(
        (node) => node.id === previousSelectedId,
      );

      if (matchingCategory) {
        return previousSelectedId;
      }

      const selectionPath = selectedPathRef.current;

      if (!selectionPath?.length) {
        return null;
      }

      return resolveTreeNodeIdByPath(nextTree, selectionPath);
    });
  }, [categories, selectedClient]);

  const selectedNode = useMemo(() => {
    return findTreeNodeData(tree, selectedId);
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
    treeClientId,
    selectedNode,
    addCategory,
    removeCategory,
    addSubCategory,
  };
}
