"use client";

import { forwardRef } from "react";
import { useTranslation } from "react-i18next";

import type { TreeNodes } from "@/components/custom/dnd/tree/types";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { SupportedLanguage } from "@/domain/config";
import { accessLevelOptions } from "@/shared/constants";

import { useApprovalStepForm } from "../hooks/useApprovalStepForm";
import { ApprovalStepData, CategoryApprovalStepData } from "../types";
import { ApprovalAssigneeField } from "./ApprovalAssigneeField";

type Props = {
  selectedNode: CategoryApprovalStepData | ApprovalStepData | null;
  language: SupportedLanguage;
  setTree: React.Dispatch<
    React.SetStateAction<TreeNodes<CategoryApprovalStepData | ApprovalStepData>>
  >;
};

export const ApprovalStepForm = forwardRef<HTMLDivElement, Props>(
  ({ selectedNode, language, setTree }, ref) => {
    const { t } = useTranslation("settings");

    const {
      languageTab,
      setLanguageTab,
      languageOptions,
      approvalTypeValueLabels,
      updateTranslation,
      assigneeTypeValueChange,
      onAssigneeTypeChange,
      onSkipAccessLevelChange,
    } = useApprovalStepForm({
      selectedNode,
      language,
      setTree,
    });

    if (!selectedNode || selectedNode.nodeType !== "approvalStep") return null;

    return (
      <div ref={ref} className="col-span-2 py-2">
        <Tabs
          value={languageTab}
          onValueChange={(value) => setLanguageTab(value as any)}
        >
          <TabsList className="w-full justify-start">
            {languageOptions.map((lang) => (
              <TabsTrigger
                key={lang.value}
                value={lang.value}
                className="min-w-20 gap-2 data-[state=inactive]:border-none"
              >
                {lang.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <FieldGroup className="mt-8 pt-2">
          <FieldSet>
            <FieldGroup>
              <Field>
                <FieldLabel>
                  {t("itServiceDeskSettings.approvalStepTab.name")}
                </FieldLabel>
                <Input
                  value={selectedNode.name[languageTab] ?? ""}
                  onChange={(e) => updateTranslation("name")(e.target.value)}
                />
              </Field>

              <Field>
                <FieldLabel>
                  {t("itServiceDeskSettings.approvalStepTab.description")}
                </FieldLabel>
                <Textarea
                  value={selectedNode.description?.[languageTab] ?? ""}
                  onChange={(e) =>
                    updateTranslation("description")(e.target.value)
                  }
                />
              </Field>

              <div className="grid grid-cols-3 gap-2">
                <Field>
                  <FieldLabel>
                    {t("itServiceDeskSettings.approvalStepTab.assigneeType")}
                  </FieldLabel>

                  <Select
                    value={selectedNode.stepAssignee.type}
                    onValueChange={(value) =>
                      onAssigneeTypeChange(value as any)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {approvalTypeValueLabels.map((approvalType) => (
                        <SelectItem
                          key={approvalType.value}
                          value={approvalType.value}
                        >
                          {approvalType.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <ApprovalAssigneeField
                  stepAssignee={selectedNode.stepAssignee}
                  onChange={assigneeTypeValueChange}
                  language={language}
                />
              </div>

              <Field>
                <FieldLabel>
                  {t("itServiceDeskSettings.approvalStepTab.skipAccessLevel")}
                </FieldLabel>

                <Select
                  value={selectedNode.skipAccessLevel?.toString()}
                  onValueChange={onSkipAccessLevelChange}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {accessLevelOptions.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value.toString()}
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </FieldGroup>
          </FieldSet>
        </FieldGroup>
      </div>
    );
  },
);

ApprovalStepForm.displayName = "ApprovalStepForm";
