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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { SupportedLanguage } from "@/domain/config";
import {
  priorityOptions,
  riskLevelOptions,
} from "@/feature/serviceDesk/shared/options";
import { NS } from "@/lib/i18n";
import { Locale, ValueLabel } from "@/shared/types";

import { scopeData } from "../constants";
import { useCategoryForm } from "../hooks/useCategoryForm";
import { CategoryData, SubCategoryData } from "../types";

type Props = {
  selectedNode: CategoryData | SubCategoryData | null;
  language: SupportedLanguage;
  setTree: React.Dispatch<
    React.SetStateAction<TreeNodes<CategoryData | SubCategoryData>>
  >;
};

export const CategoryForm = forwardRef<HTMLDivElement, Props>(
  ({ selectedNode, language, setTree }, ref) => {
    const { t } = useTranslation(NS.settings);
    const isCategoryNode = !!selectedNode && "subCategories" in selectedNode;
    const isScopeEnabled = isCategoryNode && selectedNode.isCreated;

    const {
      languageTab,
      setLanguageTab,
      languageOptions,
      updateTranslation,
      updateValue,
    } = useCategoryForm({
      selectedNode,
      language,
      setTree,
    });

    const priorityData = useMemo((): ValueLabel[] => {
      if (!priorityOptions) return [];

      return priorityOptions.map((priority) => {
        return {
          value: priority.value,
          label: t(`enum.priority.options.${priority.value}`, { ns: "domain" }),
        };
      });
    }, [t]);

    const riskLevelData = useMemo((): ValueLabel[] => {
      if (!riskLevelOptions) return [];

      return riskLevelOptions.map((riskLevel) => {
        return {
          value: riskLevel.value,
          label: t(`enum.riskLevel.options.${riskLevel.value}`, {
            ns: "domain",
          }),
        };
      });
    }, [t]);

    return (
      <div ref={ref}>
        <Tabs
          value={languageTab}
          onValueChange={(value) => setLanguageTab(value as Locale)}
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
                <FieldLabel htmlFor="category-input-name">
                  {t("serviceDeskSettings.categoryTab.name")}
                </FieldLabel>
                <Input
                  id="category-input-name"
                  data-testid="category-name"
                  disabled={!selectedNode}
                  className="!disabled:border-primary"
                  value={selectedNode?.name[languageTab] ?? ""}
                  onChange={(e) => updateTranslation("name")(e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="category-textarea-description">
                  {t("serviceDeskSettings.categoryTab.description")}
                </FieldLabel>
                <Textarea
                  id="category-textarea-description"
                  disabled={!selectedNode}
                  className="!disabled:border-primary"
                  value={selectedNode?.description?.[languageTab] ?? ""}
                  onChange={(e) =>
                    updateTranslation("description")(e.target.value)
                  }
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="category-textarea-request-template">
                  {t("serviceDeskSettings.categoryTab.requestTemplate")}
                </FieldLabel>
                <Textarea
                  id="category-textarea-request-template"
                  disabled={!selectedNode}
                  className="!disabled:border-primary"
                  value={selectedNode?.requestTemplate?.[languageTab] ?? ""}
                  onChange={(e) =>
                    updateTranslation("requestTemplate")(e.target.value)
                  }
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="category-select-scope">
                  {t("serviceDeskSettings.categoryTab.scope")}
                </FieldLabel>
                <Select
                  value={isCategoryNode ? selectedNode.scope : undefined}
                  onValueChange={updateValue("scope")}
                  disabled={!isScopeEnabled}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent id="category-select-scope">
                    {scopeData.map((scope) => (
                      <SelectItem key={scope.value} value={scope.value}>
                        {scope.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <div className="grid grid-cols-3 gap-2">
                <Field>
                  <FieldLabel htmlFor="category-select-priority">
                    {t("enum.priority.label", { ns: "domain" })}
                  </FieldLabel>
                  <Select
                    value={selectedNode?.defaultPriority}
                    onValueChange={updateValue("defaultPriority")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent id="category-select-priority">
                      {priorityData.map((priority) => (
                        <SelectItem key={priority.value} value={priority.value}>
                          {priority.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel htmlFor="category-select-risk-level">
                    {t("enum.riskLevel.label", { ns: "domain" })}
                  </FieldLabel>
                  <Select
                    value={selectedNode?.defaultRiskLevel}
                    onValueChange={updateValue("defaultRiskLevel")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent id="category-select-risk-level">
                      {riskLevelData.map((riskLevel) => (
                        <SelectItem
                          key={riskLevel.value}
                          value={riskLevel.value}
                        >
                          {riskLevel.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel htmlFor="category-input-resolution-days">
                    {t("serviceDeskSettings.categoryTab.resolutionDays")}
                  </FieldLabel>
                  <Input
                    id="category-input-resolution-days"
                    disabled={!selectedNode}
                    className="w-20"
                    value={selectedNode?.defaultSlaDays}
                    onChange={(e) => {
                      updateValue("defaultSlaDays")(parseInt(e.target.value));
                    }}
                    type={"number"}
                    min={0}
                  />
                </Field>
              </div>
              <Field>
                <FieldLabel htmlFor="category-switch-active">
                  {t("serviceDeskSettings.categoryTab.active")}
                </FieldLabel>
                <span>
                  <Switch
                    id="category-switch-active"
                    disabled={!selectedNode}
                    className="!disabled:color-primary"
                    checked={selectedNode?.active ?? false}
                    onCheckedChange={updateValue("active")}
                  />
                </span>
              </Field>
            </FieldGroup>
          </FieldSet>
        </FieldGroup>
      </div>
    );
  },
);

CategoryForm.displayName = "CategoryForm";
