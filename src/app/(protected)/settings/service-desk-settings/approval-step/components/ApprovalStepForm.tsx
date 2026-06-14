"use client";

import { forwardRef, useMemo } from "react";
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
import { NS } from "@/lib/i18n";
import { accessLevelOptions, getLanguageOptions } from "@/shared/constants";
import { ValueLabel } from "@/shared/types";

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
    const { t } = useTranslation(NS.settings);
    const localLocales = getLanguageOptions(t);

    const {
      languageTab,
      setLanguageTab,
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

    const accessLevelData = useMemo((): ValueLabel[] => {
      if (!accessLevelOptions) return [];

      return accessLevelOptions.map((accessLevel) => {
        return {
          value: accessLevel.value.toString(),
          label: t(`enum.accessLevel.options.${accessLevel.label}`, {
            ns: "domain",
          }),
        };
      });
    }, [t]);

    // displat empty box.
    if (!selectedNode || selectedNode.nodeType !== "approvalStep") {
      return (
        <div className="col-span-2 h-full rounded-lg border border-dashed p-7 text-sm text-muted-foreground">
          {t("serviceDeskSettings.approvalStepTab.empty")}
        </div>
      );
    }

    return (
      <div ref={ref} className="col-span-2 py-2">
        <Tabs
          value={languageTab}
          onValueChange={(value) => setLanguageTab(value as any)}
        >
          <TabsList className="w-full justify-start">
            {localLocales.map((locale) => (
              <TabsTrigger
                key={locale.value}
                value={locale.value}
                className="min-w-20 gap-2 data-[state=inactive]:border-none"
              >
                {locale.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <FieldGroup className="mt-8 pt-2">
          <FieldSet>
            <FieldGroup>
              <Field>
                <FieldLabel>
                  {t("serviceDeskSettings.approvalStepTab.name")}
                </FieldLabel>
                <Input
                  value={selectedNode.name[languageTab] ?? ""}
                  onChange={(e) => updateTranslation("name")(e.target.value)}
                />
              </Field>

              <Field>
                <FieldLabel>
                  {t("serviceDeskSettings.approvalStepTab.description")}
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
                    {t("serviceDeskSettings.approvalStepTab.assigneeType")}
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
                  {t("serviceDeskSettings.approvalStepTab.skipAccessLevel")}
                </FieldLabel>

                <Select
                  value={selectedNode.skipAccessLevel?.toString()}
                  onValueChange={onSkipAccessLevelChange}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {accessLevelData.map((accessLevel) => (
                      <SelectItem
                        key={accessLevel.value}
                        value={accessLevel.value.toString()}
                      >
                        {accessLevel.label}
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
