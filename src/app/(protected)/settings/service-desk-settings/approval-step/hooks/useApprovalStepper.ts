import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import type { TreeNodes } from "@/components/custom/dnd/tree/types";
import { flattenTree } from "@/components/custom/dnd/tree/utilities";
import { SupportedLanguage } from "@/lib/application/i18n";
import { NS } from "@/lib/application/i18n";

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
  const { t } = useTranslation(NS.settings);
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

    const result = [
      {
        id: "created",
        label: t("serviceDeskSettings.approvalStepTab.created"),
      },
    ];

    for (const approval of approvals) {
      result.push({
        id: approval.id.toString(),
        label: approval.data.name[language] || approval.id.toString(),
      });
    }

    result.push({
      id: "assign",
      label: t("serviceDeskSettings.approvalStepTab.assign"),
    });

    return result;
  }, [language, selectedNode, t, tree]);

  // 2. Sync currentStep automatically
  useEffect(() => {
    if (!selectedNode) return;
    if (selectedNode.nodeType === "category") return;

    const index = steps.findIndex(
      (step) => step.id === selectedNode.id.toString(),
    );

    if (index > 0) {
      setCurrentStep(index - 1);
    }
  }, [selectedNode, steps]);

  return {
    steps,
    currentStep,
    setCurrentStep,
  };
}
