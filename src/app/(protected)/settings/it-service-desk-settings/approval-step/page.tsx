"use client";

import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { useFetchItServiceDeskApprovalStep } from "@/feature/itServiceDesk";
import { useLanguageState } from "@/hooks/useLanguage";
import { DbParams } from "@/shared/types";

import { ApprovalStepForm } from "./components/ApprovalStepForm";
import { ApprovalStepperPanel } from "./components/ApprovalStepperPanel";
import { ApprovalStepTree } from "./components/ApprovalStepTree";
import { useApprovalStepTree } from "./hooks/useApprovalStepTree";

export default function ApprovalStepPage() {
  const { t } = useTranslation("settings");
  const { language } = useLanguageState();

  const params: DbParams = {};

  const { data: approvalSteps, isLoading } =
    useFetchItServiceDeskApprovalStep(params);

  const {
    tree,
    setTree,
    selectedNode,
    selectedId,
    setSelectedId,
    addApprovalStep,
    removeApprovalStep,
  } = useApprovalStepTree({ approvalSteps, language });

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-end p-2">
        <span>{t("itServiceDeskSettings.general.categoryList")}</span>
        <Button size="sm">
          {t("itServiceDeskSettings.general.saveChanges")}
        </Button>
      </div>

      <div className="grid grid-cols-5 gap-2">
        <ApprovalStepTree
          tree={tree}
          setTree={setTree}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
          addApprovalStep={addApprovalStep}
          removeApprovalStep={removeApprovalStep}
          language={language}
          isLoading={isLoading}
        />

        <ApprovalStepForm
          selectedNode={selectedNode}
          language={language}
          setTree={setTree}
        />

        <ApprovalStepperPanel
          selectedNode={selectedNode}
          tree={tree}
          language={language}
        />
      </div>
    </div>
  );
}
