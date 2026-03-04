"use client";

import { Globe, Loader2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFetchServiceDeskApprovalStep } from "@/feature/serviceDesk";
import { useCurrentPreference } from "@/hooks/useCurrentPreference";
import { languageOptions } from "@/shared/constants";
import { DbParams, Locale } from "@/shared/types";

import { ApprovalStepForm } from "./components/ApprovalStepForm";
import { ApprovalStepperPanel } from "./components/ApprovalStepperPanel";
import { ApprovalStepTree } from "./components/ApprovalStepTree";
import { useApprovalStepTree } from "./hooks/useApprovalStepTree";

export default function ApprovalStepPage() {
  const { t } = useTranslation("settings");

  const { current: userPreference } = useCurrentPreference();
  const [language, setLanguage] = useState<Locale>(userPreference.language);

  const params: DbParams = {};

  const { data: approvalSteps, isLoading } =
    useFetchServiceDeskApprovalStep(params);

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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-nowrap">
              {t("serviceDeskSettings.general.categoryList")}
            </span>
            <Select
              value={language}
              onValueChange={(value) => setLanguage(value as Locale)}
            >
              <SelectTrigger className="border-none">
                <Globe className="w-4 mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languageOptions.map((language) => (
                  <SelectItem
                    key={`select_item_${language.value}`}
                    value={language.value}
                  >
                    {language.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button size="sm">
          {t("serviceDeskSettings.general.saveChanges")}
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
