"use client";

import { forwardRef, useMemo } from "react";
import { useTranslation } from "react-i18next";

import { AvatarMultiComboBox } from "@/components/custom/AvatarComboBox";
import type { TreeNodes } from "@/components/custom/dnd/tree/types";
import { MultiComboBox } from "@/components/custom/MultiComboBox";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { CategoryScope } from "@/domain/serviceDesk";
import { useEmployeeListQuery } from "@/feature/organization/employee/client";
import { useJobFieldListQuery } from "@/feature/organization/jobField/client";
import { SupportedLanguage } from "@/lib/application/i18n";
import { NS } from "@/lib/application/i18n";
import { getLanguageOptions } from "@/lib/client/i18n";
import { useLocalizedValue } from "@/lib/client/i18n";
import type {
  DbParams,
  ImageValueLabel,
  Locale,
  ValueLabel,
} from "@/shared/types";
import { combineRuleGroups, createFieldFilter } from "@/shared/utils/routing";

import { MAX_EMPLOYEE_PER_CATEGORY } from "../constants";
import { useAssignmentRuleForm } from "../hooks/useAssignmentRuleForm";
import { AssignmentRuleData, SubAssignmentRuleData } from "../types";

type Props = {
  selectedNode: AssignmentRuleData | SubAssignmentRuleData | null;
  language: SupportedLanguage;
  setTree: React.Dispatch<
    React.SetStateAction<TreeNodes<AssignmentRuleData | SubAssignmentRuleData>>
  >;
  readOnly?: boolean;
  scope: CategoryScope;
  companyId: string | null;
};

export const AssignmentRuleForm = forwardRef<HTMLDivElement, Props>(
  (
    {
      selectedNode,
      language,
      setTree,
      readOnly = false,
      scope,
      companyId,
    },
    ref,
  ) => {
    const { t } = useTranslation(NS.settings);
    const tLocal = useLocalizedValue(language);
    const localLocales = getLanguageOptions(t);

    const {
      languageTab,
      setLanguageTab,
      assigneeChange,
      includeTenantCompanyChange,
    } = useAssignmentRuleForm({
      selectedNode,
      language,
      setTree,
    });

    const employeeListParams = useMemo<DbParams>(
      () => ({
        filter: combineRuleGroups([
          createFieldFilter({
            field: "companyId",
            value: companyId,
          }),
          createFieldFilter({
            field: "e_active",
            value: true,
          }),
        ]),
      }),
      [companyId],
    );
    const jobFieldListParams = useMemo<DbParams>(
      () => ({
        filter: combineRuleGroups([
          createFieldFilter({
            field: "companyId",
            value: companyId,
          }),
          createFieldFilter({
            field: "jf_active",
            value: true,
          }),
        ]),
      }),
      [companyId],
    );
    const { data: employees, isLoading: isEmployeesLoading } =
      useEmployeeListQuery(employeeListParams);
    const { data: jobFields = [], isLoading: isJobFieldsLoading } =
      useJobFieldListQuery(jobFieldListParams);
    const isReferenceDataLoading = isEmployeesLoading || isJobFieldsLoading;

    const jobFieldData = useMemo((): ValueLabel[] => {
      const options = jobFields.map((jobField) => {
        return {
          value: jobField.id,
          label: tLocal(jobField.name),
        };
      });

      const optionIds = new Set(options.map((option) => option.value));

      return [
        ...options,
        ...(selectedNode?.jobFieldIds ?? [])
          .filter((id) => !optionIds.has(id))
          .map((id) => ({ value: id, label: id })),
      ];
    }, [jobFields, selectedNode?.jobFieldIds, tLocal]);

    const employeeData = useMemo((): ImageValueLabel[] => {
      const options = (employees ?? []).map((employee) => {
        const name = tLocal(employee.name);
        return {
          value: employee.username,
          label: `${name.first} ${name.last}`,
          displayName: employee.email,
          image: employee.imageUrl,
        };
      });

      const optionUsernames = new Set(options.map((option) => option.value));

      return [
        ...options,
        ...(selectedNode?.assigneeUsernames ?? [])
          .filter((username) => !optionUsernames.has(username))
          .map((username) => ({
            value: username,
            label: username,
            displayName: username,
          })),
      ];
    }, [employees, selectedNode?.assigneeUsernames, tLocal]);

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
          <FieldSet disabled={readOnly}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="category-input-name">
                  {t("serviceDeskSettings.common.category")}
                </FieldLabel>
                <Input
                  id="category-input-name"
                  data-testid="category-name"
                  className="!disabled:border-primary"
                  value={selectedNode.name[languageTab] ?? ""}
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
                  readOnly={readOnly}
                  disabled={isReferenceDataLoading}
                  isLoading={isReferenceDataLoading}
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
                  readOnly={readOnly}
                  disabled={isReferenceDataLoading}
                  isLoading={isReferenceDataLoading}
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
              {scope === "PORTAL" && (
                <Field orientation="horizontal">
                  <div className="flex flex-1 flex-col gap-1">
                    <FieldLabel htmlFor="assignment-rule-include-tenant-company">
                      {t(
                        "serviceDeskSettings.assignmentRuleTab.includeTenantCompany",
                      )}
                    </FieldLabel>
                    <p className="text-sm text-muted-foreground">
                      {t(
                        "serviceDeskSettings.assignmentRuleTab.includeTenantCompanyDescription",
                      )}
                    </p>
                  </div>
                  <Switch
                    id="assignment-rule-include-tenant-company"
                    checked={selectedNode.includeTenantCompany === true}
                    disabled={readOnly}
                    onCheckedChange={includeTenantCompanyChange}
                  />
                </Field>
              )}
            </FieldGroup>
          </FieldSet>
        </FieldGroup>
      </div>
    );
  },
);

AssignmentRuleForm.displayName = "AssignmentRuleForm";
