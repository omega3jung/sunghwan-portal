import type { UniqueIdentifier } from "@dnd-kit/core";
import { useMemo, useRef } from "react";

import {
  buildTree,
  flattenTree,
  removeItem,
} from "@/components/custom/SortableTree";
import type { CategoryScope, TenantCategoryTree } from "@/domain/serviceDesk";

import { useServiceDeskSettingsTreeDraft } from "../../hooks/useServiceDeskSettingsTreeDraft";
import {
  getDefaultCategoryData,
  getDefaultSubCategoryData,
  MAX_SUB_CATEGORY_PER_CATEGORY,
} from "../constants";
import type { CategoryData, SubCategoryData } from "../types";
import { createCategoryTree } from "../utils/mapper";
import { createCategorySettingsSignatureFromTree } from "../utils/tree";

type UseCategoryTreeOptions = {
  contextKey: string | null;
  selectedTenant: string | null;
  categories: TenantCategoryTree[] | undefined;
};

export function useCategoryTree({
  contextKey,
  selectedTenant,
  categories,
}: UseCategoryTreeOptions) {
  const newCategoryCountRef = useRef(1);
  const newSubCategoryCountRef = useRef(1);
  const source = useMemo(() => {
    if (!contextKey || !categories || !selectedTenant) {
      return undefined;
    }

    const tree = createCategoryTree(categories, selectedTenant);

    return {
      contextKey,
      tree,
      signature: createCategorySettingsSignatureFromTree(tree),
    };
  }, [categories, contextKey, selectedTenant]);
  const draft = useServiceDeskSettingsTreeDraft<
    CategoryData | SubCategoryData
  >({
    contextKey,
    source,
    getTreeSignature: createCategorySettingsSignatureFromTree,
  });
  const selectedParentCategory = useMemo<CategoryData | null>(() => {
    if (
      draft.selectedId === null ||
      draft.selectedNode?.nodeType !== "subCategory"
    ) {
      return null;
    }

    const parentNode = draft.tree.find((node) =>
      node.children.some((child) => child.id === draft.selectedId),
    );

    return parentNode?.data.nodeType === "category" ? parentNode.data : null;
  }, [draft.selectedId, draft.selectedNode, draft.tree]);

  const addCategory = (scope: CategoryScope) => {
    const categoryCount = newCategoryCountRef.current;
    newCategoryCountRef.current += 1;

    draft.setTree((previousTree) => {
      const data = {
        ...getDefaultCategoryData(categoryCount),
        scope,
      };

      return [
        {
          id: data.id,
          data,
          collapsed: false,
          maximum: MAX_SUB_CATEGORY_PER_CATEGORY,
          children: [],
        },
        ...previousTree,
      ];
    });
  };

  const removeCategory = (id: UniqueIdentifier) => {
    draft.setTree((previousTree) => removeItem(previousTree, id));
    draft.setSelectedId((previousId) => (previousId === id ? null : previousId));
  };

  const addSubCategory = (parentId: UniqueIdentifier) => {
    const subCategoryCount = newSubCategoryCountRef.current;
    newSubCategoryCountRef.current += 1;

    draft.setTree((previousTree) => {
      const flattenedTree = flattenTree(previousTree);
      const parentIndex = flattenedTree.findIndex(
        (item) => item.id === parentId,
      );

      if (parentIndex === -1) {
        return previousTree;
      }

      const newSubCategory = getDefaultSubCategoryData(subCategoryCount);
      const newNode = {
        id: newSubCategory.id,
        parentId,
        depth: 1,
        index: 0,
        data: newSubCategory,
        children: [],
      };
      const insertIndex = parentIndex + 1;

      return buildTree([
        ...flattenedTree.slice(0, insertIndex),
        newNode,
        ...flattenedTree.slice(insertIndex),
      ]);
    });
  };

  return {
    ...draft,
    selectedParentCategory,
    addCategory,
    removeCategory,
    addSubCategory,
  };
}
