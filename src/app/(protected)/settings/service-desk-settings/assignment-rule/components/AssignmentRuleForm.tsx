"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { AvatarMultiComboBox } from "@/components/custom/AvatarComboBox";
import { MultiHierarchicalSelect } from "@/components/custom/HierarchicalSelect";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import type { AssigneeGroup, CategoryScope } from "@/domain/serviceDesk";
import { SupportedLanguage } from "@/lib/application/i18n";
import { NS } from "@/lib/application/i18n";
import { useLocalizedText, useLocalizedValue } from "@/lib/client/i18n";
import type { ImageValueLabel } from "@/shared/types";

import {
  ServiceDeskSettingsEditorEmptyState,
  ServiceDeskSettingsLanguageEditor,
} from "../../components/ServiceDeskSettingsLanguageEditor";
import { useServiceDeskSettingsEditorLanguage } from "../../hooks/useServiceDeskSettingsEditorLanguage";
import { useServiceDeskSettingsOrganizationData } from "../../hooks/useServiceDeskSettingsOrganizationData";
import { buildJobFieldItems } from "../../utils/jobFieldItems";
import { MAX_EMPLOYEE_PER_CATEGORY } from "../constants";
import type { AssignmentRuleNodeData } from "../types";
import {
  getEffectiveAssignmentRuleAssignee,
  updateAssignmentRuleNodeAssignee,
} from "../utils/tree";

type Props = {
  selectedNode: AssignmentRuleNodeData | null;
  inheritedAssignee: AssigneeGroup | null;
  language: SupportedLanguage;
  onChange: (
    updater: (data: AssignmentRuleNodeData) => AssignmentRuleNodeData,
  ) => void;
  readOnly?: boolean;
  scope: CategoryScope;
  companyId: string | null;
};

export function AssignmentRuleForm({
  selectedNode,
  inheritedAssignee,
  language,
  onChange,
  readOnly = false,
  scope,
  companyId,
}: Props) {
  const { t } = useTranslation(NS.settings);
  const tLocal = useLocalizedValue(language);
  const tLocalText = useLocalizedText(language);

  const { editorLanguage, setEditorLanguage } =
    useServiceDeskSettingsEditorLanguage(language);
  const assignee = selectedNode
    ? getEffectiveAssignmentRuleAssignee(selectedNode, inheritedAssignee)
    : null;

  const organization = useServiceDeskSettingsOrganizationData({
    companyId,
    enabled: selectedNode !== null,
    includeDepartments: true,
  });
  const employees = organization.employees;

  const jobFieldItems = useMemo(
    () =>
      buildJobFieldItems({
        departments: organization.departments ?? [],
        jobFields: organization.jobFields ?? [],
        selectedJobFieldIds: assignee?.jobFieldIds ?? [],
        getLocalizedText: tLocalText,
        fallbackDepartmentLabel: t(
          "serviceDeskSettings.approvalStepTab.department",
        ),
      }),
    [
      assignee?.jobFieldIds,
      organization.departments,
      organization.jobFields,
      t,
      tLocalText,
    ],
  );

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
      ...(assignee?.assigneeUsernames ?? [])
        .filter((username) => !optionUsernames.has(username))
        .map((username) => ({
          value: username,
          label: username,
          displayName: username,
        })),
    ];
  }, [assignee?.assigneeUsernames, employees, tLocal]);

  const updateNode = (
    updater: (data: AssignmentRuleNodeData) => AssignmentRuleNodeData,
  ) => {
    if (selectedNode) {
      onChange(updater);
    }
  };

  const assigneeChange =
    (key: Exclude<keyof AssigneeGroup, "includeTenantCompany">) =>
    (ids: string[]) => {
      updateNode((data) =>
        updateAssignmentRuleNodeAssignee(data, {
          ...getEffectiveAssignmentRuleAssignee(data, inheritedAssignee),
          [key]: ids,
        }),
      );
    };

  const includeTenantCompanyChange = (checked: boolean) => {
    updateNode((data) =>
      updateAssignmentRuleNodeAssignee(data, {
        ...getEffectiveAssignmentRuleAssignee(data, inheritedAssignee),
        includeTenantCompany: checked,
      }),
    );
  };

  // Display the empty state until a category is selected.
  if (!selectedNode || !assignee) {
    return (
      <ServiceDeskSettingsEditorEmptyState>
        {t("serviceDeskSettings.assignmentRuleTab.empty")}
      </ServiceDeskSettingsEditorEmptyState>
    );
  }

  return (
    <ServiceDeskSettingsLanguageEditor
      activeLanguage={editorLanguage}
      onLanguageChange={setEditorLanguage}
    >
      <FieldGroup>
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
                value={selectedNode.name[editorLanguage] ?? ""}
                readOnly
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="assignment-rule-select-job-field">
                {t("serviceDeskSettings.assignmentRuleTab.jobField")}
              </FieldLabel>
              <MultiHierarchicalSelect
                id="assignment-rule-select-job-field"
                badgeVariant="secondary"
                items={jobFieldItems}
                value={assignee.jobFieldIds}
                readOnly={readOnly}
                disabled={organization.isLoading}
                isLoading={organization.isLoading}
                placeholder={t(
                  "serviceDeskSettings.assignmentRuleTab.selectAssigneeJobField",
                )}
                backLabel={t("action.back", { ns: NS.common })}
                emptyText={t("empty.withItem", {
                  ns: NS.common,
                  item: t("serviceDeskSettings.assignmentRuleTab.jobField"),
                })}
                selectableStrategy="leaf-only"
                onValueChange={assigneeChange("jobFieldIds")}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="assignment-rule-select-employee">
                {t("serviceDeskSettings.assignmentRuleTab.employee")}
              </FieldLabel>
              <AvatarMultiComboBox
                id="assignment-rule-select-employee"
                placeholderClassName="font-normal flex items-center pl-2 text-muted-foreground"
                badgeVariant={"primary"}
                options={employeeData}
                value={assignee.assigneeUsernames}
                readOnly={readOnly}
                disabled={organization.isLoading}
                isLoading={organization.isLoading}
                maxImages={MAX_EMPLOYEE_PER_CATEGORY}
                placeholder={t(
                  "serviceDeskSettings.assignmentRuleTab.selectAssignee",
                )}
                onSelect={(selected) => {
                  if (selected) {
                    assigneeChange("assigneeUsernames")([
                      ...assignee.assigneeUsernames,
                      selected,
                    ]);
                  }
                }}
                onRemove={(selected) => {
                  assigneeChange("assigneeUsernames")(
                    assignee.assigneeUsernames.filter(
                      (value) => value !== selected,
                    ),
                  );
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
                  checked={assignee.includeTenantCompany === true}
                  disabled={readOnly}
                  onCheckedChange={includeTenantCompanyChange}
                />
              </Field>
            )}
          </FieldGroup>
        </FieldSet>
      </FieldGroup>
    </ServiceDeskSettingsLanguageEditor>
  );
}
