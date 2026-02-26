import type { UniqueIdentifier } from "@dnd-kit/core";
import { useEffect, useMemo, useState } from "react";

import type { TreeNodes } from "@/components/custom/dnd/tree/types";
import {
  buildTree,
  flattenTree,
  removeItem,
} from "@/components/custom/dnd/tree/utilities";
import { SupportedLanguage } from "@/domain/config";
import { CategoryApprovalSettings } from "@/domain/itServiceDesk";

import {
  getDefaultApprovalData,
  MAX_APPROVAL_STEP_PER_CATEGORY,
} from "../constnats";
import type { ApprovalStepData, CategoryApprovalStepData } from "../types";
import { approvalStepToTree, mapApprovalData } from "../util.mapper";

type Params = {
  approvalSteps: CategoryApprovalSettings[] | undefined;
  language: SupportedLanguage;
};

export function useApprovalStepTree({ approvalSteps, language }: Params) {
  const [tree, setTree] = useState<
    TreeNodes<CategoryApprovalStepData | ApprovalStepData>
  >([]);

  const [selectedId, setSelectedId] = useState<UniqueIdentifier | null>(null);

  const [newStepCount, setNewStepCount] = useState(1);

  useEffect(() => {
    if (!approvalSteps) return;

    const mapped = mapApprovalData(approvalSteps);
    setTree(approvalStepToTree(mapped));
  }, [approvalSteps]);

  const extractCategoryId = (value: UniqueIdentifier | null) => {
    if (!value) return null;

    try {
      return value.toString().split(":")[1];
    } catch (e) {
      return value;
    }
  };

  const selectedNode = useMemo(() => {
    if (!selectedId) return null;

    const flattened = flattenTree(tree);
    const found = flattened.find((n) => n.id === selectedId);

    if (!found) return null;

    if (found.data.nodeType === "approvalStep") {
      return {
        ...found.data,
        categoryId: extractCategoryId(found.parentId),
      } as ApprovalStepData;
    }

    return found.data;
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
    selectedNode,
    addApprovalStep,
    removeApprovalStep,
  };
}
