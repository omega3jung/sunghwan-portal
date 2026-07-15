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
import {
  CategoryApprovalSettings,
  CategoryScope,
  TenantCategoryTree,
} from "@/domain/serviceDesk";
import { SupportedLanguage } from "@/lib/application/i18n";

import {
  getDefaultApprovalData,
  MAX_APPROVAL_STEP_PER_CATEGORY,
} from "../constants";
import { ApprovalStepData, CategoryApprovalStepData } from "../types";
import { approvalStepToTree, mapApprovalData } from "../utils/mapper";

type UseApprovalStepTreeOptions = {
  selectedTenant: string | null;
  scope: CategoryScope;
  categories: TenantCategoryTree[] | undefined;
  approvalSteps: CategoryApprovalSettings[] | undefined;
  language: SupportedLanguage;
};

export function useApprovalStepTree({
  selectedTenant,
  scope,
  categories,
  approvalSteps,
  language: _language,
}: UseApprovalStepTreeOptions) {
  const [tree, setTree] = useState<
    TreeNodes<CategoryApprovalStepData | ApprovalStepData>
  >([]);

  const [selectedId, setSelectedId] = useState<UniqueIdentifier | null>(null);
  const [treeTenantId, setTreeTenantId] = useState<string | null>(null);
  const [treeContextKey, setTreeContextKey] = useState<string | null>(null);

  const [newStepCount, setNewStepCount] = useState(1);
  const previousContextRef = useRef<string | null>(null);
  const selectedPathRef = useRef<TreeNodePath | null>(null);

  useEffect(() => {
    selectedPathRef.current = findTreeNodePath(tree, selectedId);
  }, [selectedId, tree]);

  useEffect(() => {
    if (!categories || !selectedTenant || !approvalSteps) return;

    const contextKey = `${selectedTenant}:${scope}`;
    const scopedCategories = categories.map((tenant) => ({
      ...tenant,
      categories: tenant.categories.filter((category) => category.scope === scope),
    }));
    const mapped = mapApprovalData(
      scopedCategories,
      selectedTenant,
      approvalSteps,
    );
    const nextTree = approvalStepToTree(mapped);

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

      const selectionPath = selectedPathRef.current;

      if (!selectionPath?.length) {
        return null;
      }

      return resolveTreeNodeIdByPath(nextTree, selectionPath);
    });
  }, [approvalSteps, categories, scope, selectedTenant]);

  const selectedNode = useMemo(() => {
    return findTreeNodeData(tree, selectedId);
  }, [selectedId, tree]);

  // ✅ add
  const addApprovalStep = (parentId: UniqueIdentifier) => {
    setTree((prev) => {
      const flattened = flattenTree(prev);

      const parentIndex = flattened.findIndex((item) => item.id === parentId);
      if (parentIndex === -1) return prev;

      const stepCount = flattened.filter(
        (node) => node.parentId === parentId,
      ).length;

      if (stepCount >= MAX_APPROVAL_STEP_PER_CATEGORY) return prev;

      const parentNode = flattened[parentIndex];

      if (parentNode.data.nodeType !== "category") return prev;

      const newApprovalStep = getDefaultApprovalData(
        parentNode.data.categoryId,
        newStepCount,
      );

      const insertIndex = parentIndex + stepCount + 1;

      const newNode = {
        id: newApprovalStep.id,
        parentId,
        depth: parentNode.depth + 1,
        index: 0,
        data: newApprovalStep,
        children: [],
      };

      const next = [
        ...flattened.slice(0, insertIndex),
        newNode,
        ...flattened.slice(insertIndex),
      ];

      return buildTree(next);
    });

    setNewStepCount((prev) => prev + 1);
  };

  // ✅ remove
  const removeApprovalStep = (id: UniqueIdentifier) => {
    setTree((prev) => {
      return removeItem(prev, id);
    });
    setSelectedId((prev) => (prev === id ? null : prev));
  };

  return {
    tree,
    setTree,
    selectedId,
    setSelectedId,
    treeTenantId,
    treeContextKey,
    selectedNode,
    addApprovalStep,
    removeApprovalStep,
  };
}
