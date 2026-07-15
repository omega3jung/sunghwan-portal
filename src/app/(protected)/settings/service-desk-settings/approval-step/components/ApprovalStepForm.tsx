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
import { useDepartmentListQuery } from "@/feature/organization/department/client";
import { useEmployeeListQuery } from "@/feature/organization/employee/client";
import { useJobFieldListQuery } from "@/feature/organization/jobField/client";
import { accessLevelOptions } from "@/lib/application/auth";
import { SupportedLanguage } from "@/lib/application/i18n";
import { getLanguageOptions } from "@/lib/client/i18n";
import { NS } from "@/lib/i18n";
import type { DbParams, ValueLabel } from "@/shared/types";
import { combineRuleGroups, createFieldFilter } from "@/shared/utils/routing";

import { useApprovalStepForm } from "../hooks/useApprovalStepForm";
import { ApprovalStepData, CategoryApprovalStepData } from "../types";
import { ApprovalAssigneeField } from "./ApprovalAssigneeField";

type Props = {
  selectedNode: CategoryApprovalStepData | ApprovalStepData | null;
  language: SupportedLanguage;
  setTree: React.Dispatch<
    React.SetStateAction<TreeNodes<CategoryApprovalStepData | ApprovalStepData>>
  >;
  readOnly?: boolean;
};

export const ApprovalStepForm = forwardRef<HTMLDivElement, Props>(
  ({ selectedNode, language, setTree, readOnly = false }, ref) => {
    const { t } = useTranslation(NS.settings);
    const localLocales = getLanguageOptions(t);
    const selectedCategoryId =
      selectedNode?.nodeType === "approvalStep"
        ? selectedNode.categoryId
        : null;
    const employeeListParams = useMemo<DbParams>(
      () => ({
        filter: combineRuleGroups([
          createFieldFilter({
            field: "categoryId",
            value: selectedCategoryId,
          }),
          createFieldFilter({
            field: "purpose",
            value: selectedCategoryId ? "APPROVAL" : null,
          }),
          createFieldFilter({
            field: "e_active",
            value: true,
          }),
        ]),
      }),
      [selectedCategoryId],
    );
    const { data: employees, isLoading: isEmployeesLoading } =
      useEmployeeListQuery(employeeListParams);
    const { data: allDepartments, isLoading: isDepartmentsLoading } =
      useDepartmentListQuery(employeeListParams);
    const { data: allJobFields, isLoading: isJobFieldsLoading } =
      useJobFieldListQuery(employeeListParams);

    const departments = useMemo(() => {
      const eligibleIds = new Set(
        (employees ?? []).map((employee) => employee.departmentId),
      );
      const selectedId =
        selectedNode?.nodeType === "approvalStep" &&
        selectedNode.stepAssignee.type === "DEPARTMENT"
          ? selectedNode.stepAssignee.departmentId
          : null;

      return (allDepartments ?? []).filter(
        (department) =>
          eligibleIds.has(department.id) || department.id === selectedId,
      );
    }, [allDepartments, employees, selectedNode]);
    const jobFields = useMemo(() => {
      const eligibleIds = new Set(
        (employees ?? []).map((employee) => employee.jobFieldId),
      );
      const selectedId =
        selectedNode?.nodeType === "approvalStep" &&
        selectedNode.stepAssignee.type === "JOB_FIELD"
          ? selectedNode.stepAssignee.jobFieldId
          : null;

      return (allJobFields ?? []).filter(
        (jobField) =>
          eligibleIds.has(jobField.id) || jobField.id === selectedId,
      );
    }, [allJobFields, employees, selectedNode]);
    const isReferenceDataLoading =
      isEmployeesLoading || isDepartmentsLoading || isJobFieldsLoading;

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
          <FieldSet disabled={readOnly}>
            <FieldGroup>
              <Field>
                <FieldLabel>
                  {t("serviceDeskSettings.approvalStepTab.name")}
                </FieldLabel>
                <Input
                  value={selectedNode.name[languageTab] ?? ""}
                  disabled={readOnly}
                  onChange={(e) => updateTranslation("name")(e.target.value)}
                />
              </Field>

              <Field>
                <FieldLabel>
                  {t("serviceDeskSettings.approvalStepTab.description")}
                </FieldLabel>
                <Textarea
                  value={selectedNode.description?.[languageTab] ?? ""}
                  disabled={readOnly}
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
                    disabled={readOnly}
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
                  readOnly={readOnly}
                  employees={employees}
                  departments={departments}
                  jobFields={jobFields}
                  isLoading={isReferenceDataLoading}
                />
              </div>

              <Field>
                <FieldLabel>
                  {t("serviceDeskSettings.approvalStepTab.skipAccessLevel")}
                </FieldLabel>

                <Select
                  value={selectedNode.skipAccessLevel?.toString()}
                  disabled={readOnly}
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
