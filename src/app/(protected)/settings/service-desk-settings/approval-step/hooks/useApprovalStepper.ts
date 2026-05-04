import { useEffect, useMemo, useState } from "react";

import type { TreeNodes } from "@/components/custom/dnd/tree/types";
import { flattenTree } from "@/components/custom/dnd/tree/utilities";
import { SupportedLanguage } from "@/domain/config";

import { ApprovalStepData, CategoryApprovalStepData } from "../types";

type UseApprovalStepperOptions = {
  selectedNode: CategoryApprovalStepData | ApprovalStepData | null;
  tree: TreeNodes<CategoryApprovalStepData | ApprovalStepData>;
  language: SupportedLanguage;
};

export function useApprovalStepper({
  selectedNode,
  tree,
  language,
}: UseApprovalStepperOptions) {
  const [currentStep, setCurrentStep] = useState(1);

  // 1. Compute the step list
  const steps = useMemo(() => {
    if (!selectedNode) return [];

    if (selectedNode.nodeType === "category") return [];

    const selectedCategoryId = `category:${selectedNode.categoryId}`;

    const flattened = flattenTree(tree);

    const approvals = flattened.filter(
      (node) => node.parentId === selectedCategoryId,
    );

    const result = [{ label: "Created" }];

    for (const approval of approvals) {
      result.push({
        label: approval.data.name[language] || approval.id.toString(),
      });
    }

    result.push({ label: "Assign" });

    return result;
  }, [selectedNode, tree, language]);

  // 2. Sync currentStep automatically
  useEffect(() => {
    if (!selectedNode) return;
    if (selectedNode.nodeType === "category") return;

    const selectedLabel = selectedNode.name[language] || selectedNode.id;

    const index = steps.findIndex((step) => step.label === selectedLabel);

    if (index > 0) {
      setCurrentStep(index - 1);
    }
  }, [selectedNode, steps, language]);

  return {
    steps,
    currentStep,
    setCurrentStep,
  };
}
