"use client";

import { forwardRef, useMemo } from "react";
import { useTranslation } from "react-i18next";

import { AvatarMultiComboBox } from "@/components/custom/AvatarComboBox";
import type { TreeNodes } from "@/components/custom/dnd/tree/types";
import { MultiComboBox } from "@/components/custom/MultiComboBox";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SupportedLanguage } from "@/domain/config";
import { useEmployeeListQuery } from "@/feature/organization/employee/client";
import { useJobFieldListQuery } from "@/feature/organization/jobField/client";
import { NS } from "@/lib/i18n";
import { getLanguageOptions } from "@/shared/constants";
import { useLocalizedValue } from "@/shared/hooks";
import { ImageValueLabel, Locale, ValueLabel } from "@/shared/types";

import { MAX_EMPLOYEE_PER_CATEGORY } from "../constants";
import { useAssignmentRuleForm } from "../hooks/useAssignmentRuleForm";
import { AssignmentRuleData, SubAssignmentRuleData } from "../types";

type Props = {
  selectedNode: AssignmentRuleData | SubAssignmentRuleData | null;
  language: SupportedLanguage;
  setTree: React.Dispatch<
    React.SetStateAction<TreeNodes<AssignmentRuleData | SubAssignmentRuleData>>
  >;
};

export const AssignmentRuleForm = forwardRef<HTMLDivElement, Props>(
  ({ selectedNode, language, setTree }, ref) => {
    const { t } = useTranslation(NS.settings);
    const tLocal = useLocalizedValue(language);
    const localLocales = getLanguageOptions(t);

    const { languageTab, setLanguageTab, assigneeChange } =
      useAssignmentRuleForm({
        selectedNode,
        language,
        setTree,
      });

    const { data: jobFields } = useJobFieldListQuery({});
    const { data: employees } = useEmployeeListQuery({});

    const jobFieldData = useMemo((): ValueLabel[] => {
      if (!jobFields) return [];

      return jobFields.map((jobField) => {
        return {
          value: jobField.id,
          label: tLocal(jobField.name),
        };
      });
    }, [jobFields, tLocal]);

    const employeeData = useMemo((): ImageValueLabel[] => {
      if (!employees) return [];

      return employees.map((employee) => {
        const name = tLocal(employee.name);
        return {
          value: employee.username,
          label: `${name.first} ${name.last}`,
          displayName: employee.email,
          image: employee.imageUrl,
        };
      });
    }, [employees, tLocal]);

    // displat empty box.
    if (!selectedNode) {
      return (
        <div className="h-full rounded-lg border border-dashed p-7 text-sm text-muted-foreground">
          {t("serviceDeskSettings.assignmentRuleTab.empty")}
        </div>
      );
    }

    return (
      <div ref={ref}>
        <Tabs
          value={languageTab}
          onValueChange={(value) => setLanguageTab(value as Locale)}
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
                <FieldLabel htmlFor="category-input-name">
                  {t("serviceDeskSettings.categoryTab.name")}
                </FieldLabel>
                <Input
                  id="category-input-name"
                  data-testid="category-name"
                  className="!disabled:border-primary"
                  value={selectedNode.name[languageTab] ?? ""}
                  placeholder={t(
                    "serviceDeskSettings.assignmentRuleTab.namePlaceholder",
                  )}
                  readOnly
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="assignment-rule-select-job-field">
                  {t("serviceDeskSettings.assignmentRuleTab.jobField")}
                </FieldLabel>
                <MultiComboBox
                  id="assignment-rule-select-job-field"
                  variant="default"
                  badgeVariant="secondary"
                  options={jobFieldData}
                  value={selectedNode.jobFieldIds || []}
                  placeholder={t(
                    "serviceDeskSettings.assignmentRuleTab.selectAssigneeJobField",
                  )}
                  onSelect={(selected: string) => {
                    assigneeChange("jobFieldIds")([
                      ...(selectedNode.jobFieldIds || []),
                      selected,
                    ]);
                  }}
                  onRemove={(selected: string) => {
                    const newChoice = selectedNode.jobFieldIds?.filter(
                      (value) => value !== selected,
                    );

                    assigneeChange("jobFieldIds")([...(newChoice || [])]);
                  }}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="assignment-rule-select-employee">
                  {t("serviceDeskSettings.assignmentRuleTab.employee")}
                </FieldLabel>
                <AvatarMultiComboBox
                  id="assignment-rule-select-employee"
                  placeholderClassName="h-8 font-normal flex items-center pl-2 text-muted-foreground"
                  badgeVariant={"primary"}
                  options={employeeData}
                  value={selectedNode.assigneeUsernames || []}
                  maxImages={MAX_EMPLOYEE_PER_CATEGORY}
                  placeholder={t(
                    "serviceDeskSettings.assignmentRuleTab.selectAssignee",
                  )}
                  onSelect={(selected) => {
                    if (selected) {
                      assigneeChange("assigneeUsernames")([
                        ...(selectedNode.assigneeUsernames || []),
                        selected,
                      ]);
                    }
                  }}
                  onRemove={(selected) => {
                    const currentValue = selectedNode.assigneeUsernames || [];
                    const currentValueIndex = currentValue.indexOf(selected);

                    if (currentValueIndex > -1) {
                      currentValue.splice(currentValueIndex, 1);
                      assigneeChange("assigneeUsernames")([...currentValue]);
                    } else {
                      return;
                    }
                  }}
                />
              </Field>
            </FieldGroup>
          </FieldSet>
        </FieldGroup>
      </div>
    );
  },
);

AssignmentRuleForm.displayName = "AssignmentRuleForm";
