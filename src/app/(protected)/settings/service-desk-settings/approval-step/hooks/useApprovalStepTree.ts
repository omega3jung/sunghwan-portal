import type { UniqueIdentifier } from "@dnd-kit/core";
import { useMemo, useRef } from "react";

import {
  buildTree,
  flattenTree,
  removeItem,
} from "@/components/custom/SortableTree";
import type {
  CategoryApprovalSettings,
  TenantCategoryTree,
} from "@/domain/serviceDesk";

import { useServiceDeskSettingsTreeDraft } from "../../hooks/useServiceDeskSettingsTreeDraft";
import {
  getDefaultApprovalData,
  MAX_APPROVAL_STEP_PER_CATEGORY,
} from "../constants";
import type { ApprovalStepData, CategoryApprovalStepData } from "../types";
import { createApprovalStepTree } from "../utils/mapper";
import { createApprovalStepSettingsSignatureFromTree } from "../utils/tree";

type UseApprovalStepTreeOptions = {
  contextKey: string | null;
  selectedTenant: string | null;
  categories: TenantCategoryTree[] | undefined;
  approvalSteps: CategoryApprovalSettings[] | undefined;
};

export function useApprovalStepTree({
  contextKey,
  selectedTenant,
  categories,
  approvalSteps,
}: UseApprovalStepTreeOptions) {
  const newStepCountRef = useRef(1);
  const source = useMemo(() => {
    if (!contextKey || !categories || !selectedTenant || !approvalSteps) {
      return undefined;
    }

    const tree = createApprovalStepTree(
      categories,
      selectedTenant,
      approvalSteps,
    );

    return {
      contextKey,
      tree,
      signature: createApprovalStepSettingsSignatureFromTree(tree),
    };
  }, [approvalSteps, categories, contextKey, selectedTenant]);
  const draft = useServiceDeskSettingsTreeDraft<
    CategoryApprovalStepData | ApprovalStepData
  >({
    contextKey,
    source,
    getTreeSignature: createApprovalStepSettingsSignatureFromTree,
  });

  const addApprovalStep = (parentId: UniqueIdentifier) => {
    const stepCount = newStepCountRef.current;

    draft.setTree((previousTree) => {
      const flattenedTree = flattenTree(previousTree);
      const parentIndex = flattenedTree.findIndex(
        (item) => item.id === parentId,
      );

      if (parentIndex === -1) {
        return previousTree;
      }

      const siblingCount = flattenedTree.filter(
        (node) => node.parentId === parentId,
      ).length;

      if (siblingCount >= MAX_APPROVAL_STEP_PER_CATEGORY) {
        return previousTree;
      }

      const parentNode = flattenedTree[parentIndex];

      if (parentNode.data.nodeType !== "category") {
        return previousTree;
      }

      const newApprovalStep = getDefaultApprovalData(
        parentNode.data.categoryId,
        stepCount,
      );
      const insertIndex = parentIndex + siblingCount + 1;

      newStepCountRef.current += 1;

      return buildTree([
        ...flattenedTree.slice(0, insertIndex),
        {
          id: newApprovalStep.id,
          parentId,
          depth: parentNode.depth + 1,
          index: 0,
          data: newApprovalStep,
          children: [],
        },
        ...flattenedTree.slice(insertIndex),
      ]);
    });
  };

  const removeApprovalStep = (id: UniqueIdentifier) => {
    draft.setTree((previousTree) => removeItem(previousTree, id));
    draft.setSelectedId((previousId) => (previousId === id ? null : previousId));
  };

  return {
    ...draft,
    addApprovalStep,
    removeApprovalStep,
  };
}
