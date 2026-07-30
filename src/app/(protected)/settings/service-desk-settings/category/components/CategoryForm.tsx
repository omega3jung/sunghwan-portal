"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";

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
import { Textarea } from "@/components/ui/textarea";
import type { CategoryScope } from "@/domain/serviceDesk";
import {
  priorityOptions,
  riskLevelOptions,
} from "@/feature/serviceDesk/shared/options";
import { SupportedLanguage } from "@/lib/application/i18n";
import { NS } from "@/lib/application/i18n";
import { ValueLabel } from "@/shared/types";

import {
  ServiceDeskSettingsEditorEmptyState,
  ServiceDeskSettingsLanguageEditor,
} from "../../components/ServiceDeskSettingsLanguageEditor";
import { ScopeSelect } from "../../components/ServiceDeskSettingsToolbar";
import { useServiceDeskSettingsEditorLanguage } from "../../hooks/useServiceDeskSettingsEditorLanguage";
import { CategoryData, SubCategoryData } from "../types";

type CategoryFormValues = {
  scope: CategoryData["scope"];
  defaultPriority:
    | CategoryData["defaultPriority"]
    | SubCategoryData["defaultPriority"];
  defaultRiskLevel:
    | CategoryData["defaultRiskLevel"]
    | SubCategoryData["defaultRiskLevel"];
  defaultSlaDays:
    | CategoryData["defaultSlaDays"]
    | SubCategoryData["defaultSlaDays"];
  active: CategoryData["active"];
};

type Props = {
  selectedNode: CategoryData | SubCategoryData | null;
  language: SupportedLanguage;
  availableScopes: readonly CategoryScope[];
  onChange: (
    updater: (
      data: CategoryData | SubCategoryData,
    ) => CategoryData | SubCategoryData,
  ) => void;
  readOnly?: boolean;
};

export function CategoryForm({
  selectedNode,
  language,
  availableScopes,
  onChange,
  readOnly = false,
}: Props) {
  const { t } = useTranslation(NS.settings);
  const isCategoryNode = selectedNode?.nodeType === "category";

  const { editorLanguage, setEditorLanguage } =
    useServiceDeskSettingsEditorLanguage(language);

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

  const updateNode = (
    updater: (
      data: CategoryData | SubCategoryData,
    ) => CategoryData | SubCategoryData,
  ) => {
    if (selectedNode) {
      onChange(updater);
    }
  };

  const updateTranslation =
    (key: "name" | "description" | "requestTemplate") => (value: string) => {
      updateNode((data) => ({
        ...data,
        [key]: {
          ...data[key],
          [editorLanguage]: value,
        },
      }));
    };

  const updateValue =
    <Key extends keyof CategoryFormValues>(key: Key) =>
    (value: CategoryFormValues[Key]) => {
      updateNode((data) => ({
        ...data,
        [key]: value,
      }));
    };

  // displat empty box.
  if (!selectedNode) {
    return (
      <ServiceDeskSettingsEditorEmptyState>
        {t("serviceDeskSettings.categoryTab.empty")}
      </ServiceDeskSettingsEditorEmptyState>
    );
  }

  return (
    <ServiceDeskSettingsLanguageEditor
      activeLanguage={editorLanguage}
      onLanguageChange={setEditorLanguage}
    >
      <FieldGroup>
        <FieldSet>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="category-input-name">
                {t("serviceDeskSettings.categoryTab.name")}
              </FieldLabel>
              <Input
                id="category-input-name"
                data-testid="category-name"
                className="!disabled:border-primary"
                value={selectedNode.name[editorLanguage] ?? ""}
                disabled={readOnly}
                onChange={(e) => updateTranslation("name")(e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="category-textarea-description">
                {t("serviceDeskSettings.categoryTab.description")}
              </FieldLabel>
              <Textarea
                id="category-textarea-description"
                className="!disabled:border-primary"
                value={selectedNode.description?.[editorLanguage] ?? ""}
                disabled={readOnly}
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
                className="!disabled:border-primary"
                value={selectedNode.requestTemplate?.[editorLanguage] ?? ""}
                disabled={readOnly}
                onChange={(e) =>
                  updateTranslation("requestTemplate")(e.target.value)
                }
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="category-select-scope">
                {t("serviceDeskSettings.categoryTab.scope")}
              </FieldLabel>
              <ScopeSelect
                value={isCategoryNode ? selectedNode.scope : null}
                availableScopes={availableScopes}
                onValueChange={updateValue("scope")}
                disabled={
                  readOnly || !isCategoryNode || !selectedNode.isCreated
                }
              />
            </Field>
            <div className="grid grid-cols-3 gap-2">
              <Field>
                <FieldLabel htmlFor="category-select-priority">
                  {t("enum.priority.label", { ns: "domain" })}
                </FieldLabel>
                <Select
                  items={priorityData}
                  value={selectedNode.defaultPriority ?? null}
                  onValueChange={(value) => {
                    if (value) {
                      updateValue("defaultPriority")(value);
                    }
                  }}
                  disabled={readOnly}
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
                  items={riskLevelData}
                  value={selectedNode.defaultRiskLevel ?? null}
                  onValueChange={(value) => {
                    if (value) {
                      updateValue("defaultRiskLevel")(value);
                    }
                  }}
                  disabled={readOnly}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent id="category-select-risk-level">
                    {riskLevelData.map((riskLevel) => (
                      <SelectItem key={riskLevel.value} value={riskLevel.value}>
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
                  className="w-20"
                  value={selectedNode.defaultSlaDays ?? ""}
                  disabled={readOnly}
                  onChange={(e) => {
                    updateValue("defaultSlaDays")(
                      e.target.value === ""
                        ? undefined
                        : Number.parseInt(e.target.value, 10),
                    );
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
                  className="!disabled:color-primary"
                  checked={selectedNode.active ?? false}
                  disabled={readOnly}
                  onCheckedChange={updateValue("active")}
                />
              </span>
            </Field>
          </FieldGroup>
        </FieldSet>
      </FieldGroup>
    </ServiceDeskSettingsLanguageEditor>
  );
}
