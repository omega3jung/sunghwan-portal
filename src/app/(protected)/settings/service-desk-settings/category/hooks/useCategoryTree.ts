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
import type { CategoryScope, TenantCategoryTree } from "@/domain/serviceDesk";

import {
  getDefaultCategoryData,
  getDefaultSubCategoryData,
} from "../constants";
import { CategoryData, SubCategoryData } from "../types";
import { categoryToTree, mapCategoryData } from "../utils/mapper";

type UseCategoryTreeOptions = {
  selectedTenant: string | null;
  scope: CategoryScope;
  categories: TenantCategoryTree[] | undefined;
};

export function useCategoryTree({
  selectedTenant,
  scope,
  categories,
}: UseCategoryTreeOptions) {
  const [tree, setTree] = useState<TreeNodes<CategoryData | SubCategoryData>>(
    [],
  );

  const [selectedId, setSelectedId] = useState<UniqueIdentifier | null>(null);
  const [treeTenantId, setTreeTenantId] = useState<string | null>(null);
  const [treeContextKey, setTreeContextKey] = useState<string | null>(null);

  const [newCategoryCount, setNewCategoryCount] = useState<number>(1);
  const [newSubCategoryCount, setNewSubCategoryCount] = useState<number>(1);
  const previousContextRef = useRef<string | null>(null);
  const selectedPathRef = useRef<TreeNodePath | null>(null);

  useEffect(() => {
    selectedPathRef.current = findTreeNodePath(tree, selectedId);
  }, [selectedId, tree]);

  useEffect(() => {
    if (!categories || !selectedTenant) return;

    const contextKey = `${selectedTenant}:${scope}`;
    const scopedCategories = categories.map((tenant) => ({
      ...tenant,
      categories: tenant.categories.filter((category) => category.scope === scope),
    }));
    const mapped = mapCategoryData(scopedCategories, selectedTenant);
    const nextTree = categoryToTree(mapped);

    setTree(nextTree);
    setTreeTenantId(selectedTenant);
    setTreeContextKey(contextKey);
    setSelectedId((previousSelectedId) => {
      if (previousContextRef.current !== contextKey) {
        previousContextRef.current = contextKey;
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
  }, [categories, scope, selectedTenant]);

  const selectedNode = useMemo(() => {
    return findTreeNodeData(tree, selectedId);
  }, [selectedId, tree]);

  const addCategory = (categoryScope: CategoryScope) => {
    setTree((prev) => {
      const newCategory = categoryToTree([{
        ...getDefaultCategoryData(newCategoryCount),
        scope: categoryScope,
      }]);

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
    treeTenantId,
    treeContextKey,
    selectedNode,
    addCategory,
    removeCategory,
    addSubCategory,
  };
}
