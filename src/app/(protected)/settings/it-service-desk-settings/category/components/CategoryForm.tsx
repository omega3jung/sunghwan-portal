"use client";

import { forwardRef } from "react";
import { useTranslation } from "react-i18next";

import type { TreeNodes } from "@/components/custom/dnd/tree/types";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { SupportedLanguage } from "@/domain/config";
import { Locale } from "@/shared/types";

import { useCategoryForm } from "../hooks/useCategoryForm";
import { CategoryData, MainCategoryData } from "../types";

type Props = {
  selectedNode: MainCategoryData | CategoryData | null;
  language: SupportedLanguage;
  setTree: React.Dispatch<
    React.SetStateAction<TreeNodes<MainCategoryData | CategoryData>>
  >;
};

export const CategoryForm = forwardRef<HTMLDivElement, Props>(
  ({ selectedNode, language, setTree }, ref) => {
    const { t } = useTranslation("settings");

    const {
      languageTab,
      setLanguageTab,
      languageOptions,
      updateTranslation,
      updateActive,
    } = useCategoryForm({
      selectedNode,
      language,
      setTree,
    });

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
                  {t("itServiceDeskSettings.categoryTab.name")}
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
                  {t("itServiceDeskSettings.categoryTab.description")}
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
                <FieldLabel htmlFor="category-textarea-placeholder">
                  {t("itServiceDeskSettings.categoryTab.placeholder")}
                </FieldLabel>
                <Textarea
                  id="category-textarea-placeholder"
                  disabled={!selectedNode}
                  className="!disabled:border-primary"
                  value={selectedNode?.placeholder?.[languageTab] ?? ""}
                  onChange={(e) =>
                    updateTranslation("placeholder")(e.target.value)
                  }
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="category-switch-active">
                  {t("itServiceDeskSettings.categoryTab.active")}
                </FieldLabel>
                <span>
                  <Switch
                    id="category-switch-active"
                    disabled={!selectedNode}
                    className="!disabled:color-primary"
                    checked={selectedNode?.active ?? false}
                    onCheckedChange={updateActive}
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
