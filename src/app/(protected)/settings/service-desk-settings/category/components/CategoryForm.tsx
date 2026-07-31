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

const FOLLOW_MAIN_CATEGORY_VALUE = "__follow_main_category__" as const;
const CUSTOM_VALUE = "__custom_value__" as const;

type PriorityValue = NonNullable<SubCategoryData["defaultPriority"]>;
type RiskLevelValue = NonNullable<SubCategoryData["defaultRiskLevel"]>;

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
  parentCategory: CategoryData | null;
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
  parentCategory,
  language,
  availableScopes,
  onChange,
  readOnly = false,
}: Props) {
  const { t } = useTranslation(NS.settings);
  const isCategoryNode = selectedNode?.nodeType === "category";
  const isSubCategoryNode = selectedNode?.nodeType === "subCategory";

  const { editorLanguage, setEditorLanguage } =
    useServiceDeskSettingsEditorLanguage(language);

  const parentScopeString = useMemo((): string | undefined => {
    if (!parentCategory) return undefined;

    return t(
      `serviceDeskSettings.common.scope${
        parentCategory.scope === "INTERNAL" ? "Internal" : "Portal"
      }`,
    );
  }, [parentCategory, t]);

  const priorityData = useMemo((): ValueLabel<PriorityValue>[] => {
    if (!priorityOptions) return [];

    return priorityOptions.map((priority) => {
      return {
        value: priority.value,
        label: t(`enum.priority.options.${priority.value}`, { ns: "domain" }),
      };
    });
  }, [t]);

  const riskLevelData = useMemo((): ValueLabel<RiskLevelValue>[] => {
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

  const prioritySelectData = useMemo((): ValueLabel<
    PriorityValue | typeof FOLLOW_MAIN_CATEGORY_VALUE
  >[] => {
    if (!isSubCategoryNode) {
      return priorityData;
    }

    const parentValue = parentCategory
      ? t(`enum.priority.options.${parentCategory.defaultPriority}`, {
          ns: "domain",
        })
      : "—";

    return [
      {
        value: FOLLOW_MAIN_CATEGORY_VALUE,
        label: t("serviceDeskSettings.categoryTab.followMainCategory", {
          value: parentValue,
        }),
      },
      ...priorityData,
    ];
  }, [isSubCategoryNode, parentCategory, priorityData, t]);

  const riskLevelSelectData = useMemo((): ValueLabel<
    RiskLevelValue | typeof FOLLOW_MAIN_CATEGORY_VALUE
  >[] => {
    if (!isSubCategoryNode) {
      return riskLevelData;
    }

    const parentValue = parentCategory
      ? t(`enum.riskLevel.options.${parentCategory.defaultRiskLevel}`, {
          ns: "domain",
        })
      : "—";

    return [
      {
        value: FOLLOW_MAIN_CATEGORY_VALUE,
        label: t("serviceDeskSettings.categoryTab.followMainCategory", {
          value: parentValue,
        }),
      },
      ...riskLevelData,
    ];
  }, [isSubCategoryNode, parentCategory, riskLevelData, t]);

  const slaModeData = useMemo((): ValueLabel[] => {
    if (!isSubCategoryNode) {
      return [];
    }

    const parentValue = parentCategory
      ? t("serviceDeskSettings.categoryTab.daysValue", {
          value: parentCategory.defaultSlaDays,
        })
      : "—";

    return [
      {
        value: FOLLOW_MAIN_CATEGORY_VALUE,
        label: t("serviceDeskSettings.categoryTab.followMainCategory", {
          value: parentValue,
        }),
      },
      {
        value: CUSTOM_VALUE,
        label: t("serviceDeskSettings.categoryTab.customValue"),
      },
    ];
  }, [isSubCategoryNode, parentCategory, t]);

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

  const updateSubCategoryValue =
    <Key extends "defaultPriority" | "defaultRiskLevel" | "defaultSlaDays">(
      key: Key,
    ) =>
    (value: SubCategoryData[Key]) => {
      updateNode((data) =>
        data.nodeType === "subCategory"
          ? {
              ...data,
              [key]: value,
            }
          : data,
      );
    };

  // Display the empty state until a category is selected.
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
                placeholder={parentScopeString}
              />
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <Field>
                <FieldLabel htmlFor="category-select-priority">
                  {t("enum.priority.label", { ns: "domain" })}
                </FieldLabel>
                <Select
                  items={prioritySelectData}
                  value={
                    isSubCategoryNode &&
                    selectedNode.defaultPriority === undefined
                      ? FOLLOW_MAIN_CATEGORY_VALUE
                      : selectedNode.defaultPriority
                  }
                  onValueChange={(value) => {
                    if (value === FOLLOW_MAIN_CATEGORY_VALUE) {
                      updateSubCategoryValue("defaultPriority")(undefined);
                    } else if (value) {
                      updateValue("defaultPriority")(value as PriorityValue);
                    }
                  }}
                  disabled={readOnly}
                >
                  <SelectTrigger id="category-select-priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {prioritySelectData.map((priority) => (
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
                  items={riskLevelSelectData}
                  value={
                    isSubCategoryNode &&
                    selectedNode.defaultRiskLevel === undefined
                      ? FOLLOW_MAIN_CATEGORY_VALUE
                      : selectedNode.defaultRiskLevel
                  }
                  onValueChange={(value) => {
                    if (value === FOLLOW_MAIN_CATEGORY_VALUE) {
                      updateSubCategoryValue("defaultRiskLevel")(undefined);
                    } else if (value) {
                      updateValue("defaultRiskLevel")(value as RiskLevelValue);
                    }
                  }}
                  disabled={readOnly}
                >
                  <SelectTrigger id="category-select-risk-level">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {riskLevelSelectData.map((riskLevel) => (
                      <SelectItem key={riskLevel.value} value={riskLevel.value}>
                        {riskLevel.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="category-input-resolution-days">
                {t("serviceDeskSettings.categoryTab.resolutionDays")}
              </FieldLabel>
              <div className="grid grid-cols-2 gap-2">
                {isSubCategoryNode && (
                  <Select
                    items={slaModeData}
                    value={
                      selectedNode.defaultSlaDays === undefined
                        ? FOLLOW_MAIN_CATEGORY_VALUE
                        : CUSTOM_VALUE
                    }
                    onValueChange={(value) => {
                      if (value === FOLLOW_MAIN_CATEGORY_VALUE) {
                        updateSubCategoryValue("defaultSlaDays")(undefined);
                      } else if (value === CUSTOM_VALUE && parentCategory) {
                        updateSubCategoryValue("defaultSlaDays")(
                          parentCategory.defaultSlaDays,
                        );
                      }
                    }}
                    disabled={readOnly}
                  >
                    <SelectTrigger className={"w-full"}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {slaModeData.map((mode) => (
                        <SelectItem key={mode.value} value={mode.value}>
                          {mode.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <Input
                  id="category-input-resolution-days"
                  className="w-20"
                  value={
                    isSubCategoryNode &&
                    selectedNode.defaultSlaDays === undefined
                      ? (parentCategory?.defaultSlaDays ?? "")
                      : selectedNode.defaultSlaDays
                  }
                  disabled={
                    readOnly ||
                    (isSubCategoryNode &&
                      selectedNode.defaultSlaDays === undefined)
                  }
                  onChange={(event) => {
                    if (event.target.value === "") {
                      if (isSubCategoryNode) {
                        updateSubCategoryValue("defaultSlaDays")(undefined);
                      }
                      return;
                    }

                    updateValue("defaultSlaDays")(
                      Number.parseInt(event.target.value, 10),
                    );
                  }}
                  type="number"
                  min={0}
                  step={1}
                />
              </div>
            </Field>
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
