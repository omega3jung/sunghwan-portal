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
import { Textarea } from "@/components/ui/textarea";
import type { AccessLevel } from "@/domain/auth";
import {
  APPROVAL_ASSIGNEE_TYPES,
  type ApprovalAssigneeType,
  type ApprovalAssigneeTypeValue,
} from "@/domain/serviceDesk";
import { accessLevelOptions } from "@/lib/application/auth";
import { SupportedLanguage } from "@/lib/application/i18n";
import { NS } from "@/lib/application/i18n";
import type { ValueLabel } from "@/shared/types";
import { camelCase } from "@/shared/utils/value";

import {
  ServiceDeskSettingsEditorEmptyState,
  ServiceDeskSettingsLanguageEditor,
} from "../../components/ServiceDeskSettingsLanguageEditor";
import { useServiceDeskSettingsEditorLanguage } from "../../hooks/useServiceDeskSettingsEditorLanguage";
import { useServiceDeskSettingsOrganizationData } from "../../hooks/useServiceDeskSettingsOrganizationData";
import { getDefaultAssigneePayload } from "../constants";
import { ApprovalStepData, CategoryApprovalStepData } from "../types";
import { ApprovalAssigneeField } from "./ApprovalAssigneeField";

type Props = {
  selectedNode: CategoryApprovalStepData | ApprovalStepData | null;
  language: SupportedLanguage;
  onChange: (
    updater: (
      data: CategoryApprovalStepData | ApprovalStepData,
    ) => CategoryApprovalStepData | ApprovalStepData,
  ) => void;
  readOnly?: boolean;
  companyId: string | null;
};

export function ApprovalStepForm({
  selectedNode,
  language,
  onChange,
  readOnly = false,
  companyId,
}: Props) {
  const { t } = useTranslation(NS.settings);
  const organization = useServiceDeskSettingsOrganizationData({
    companyId,
    enabled: selectedNode?.nodeType === "approvalStep",
    includeDepartments: true,
  });

  const { editorLanguage, setEditorLanguage } =
    useServiceDeskSettingsEditorLanguage(language);

  const approvalTypeValueLabels = useMemo(
    () =>
      APPROVAL_ASSIGNEE_TYPES.map((type) => ({
        value: type,
        label: t(
          `serviceDeskSettings.approvalStepTab.assigneeTypes.${camelCase(
            type.toLocaleLowerCase(),
          )}`,
        ),
      })),
    [t],
  );

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

  const updateApprovalStep = (
    updater: (data: ApprovalStepData) => ApprovalStepData,
  ) => {
    if (!selectedNode || selectedNode.nodeType !== "approvalStep") {
      return;
    }

    onChange((data) =>
      data.nodeType === "approvalStep" ? updater(data) : data,
    );
  };

  const updateTranslation =
    (key: "name" | "description") => (value: string) => {
      updateApprovalStep((data) => ({
        ...data,
        [key]: {
          ...data[key],
          [editorLanguage]: value,
        },
      }));
    };

  const assigneeTypeValueChange = (stepAssignee: ApprovalAssigneeType) => {
    updateApprovalStep((data) => ({
      ...data,
      stepAssignee,
    }));
  };

  const onAssigneeTypeChange = (approvalType: ApprovalAssigneeTypeValue) => {
    assigneeTypeValueChange(getDefaultAssigneePayload(approvalType));
  };

  const onSkipAccessLevelChange = (value: string) => {
    updateApprovalStep((data) => ({
      ...data,
      skipAccessLevel: Number.parseInt(value, 10) as AccessLevel,
    }));
  };

  // displat empty box.
  if (!selectedNode || selectedNode.nodeType !== "approvalStep") {
    return (
      <ServiceDeskSettingsEditorEmptyState>
        {t("serviceDeskSettings.approvalStepTab.empty")}
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
              <FieldLabel>
                {t("serviceDeskSettings.approvalStepTab.name")}
              </FieldLabel>
              <Input
                value={selectedNode.name[editorLanguage] ?? ""}
                disabled={readOnly}
                onChange={(e) => updateTranslation("name")(e.target.value)}
              />
            </Field>

            <Field>
              <FieldLabel>
                {t("serviceDeskSettings.approvalStepTab.description")}
              </FieldLabel>
              <Textarea
                value={selectedNode.description?.[editorLanguage] ?? ""}
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
                  items={approvalTypeValueLabels}
                  value={selectedNode.stepAssignee.type}
                  disabled={readOnly}
                  onValueChange={(value) =>
                    onAssigneeTypeChange(value as ApprovalAssigneeTypeValue)
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
                employees={organization.employees}
                departments={organization.departments ?? []}
                jobFields={organization.jobFields ?? []}
                isLoading={organization.isLoading}
              />
            </div>

            <Field>
              <FieldLabel>
                {t("serviceDeskSettings.approvalStepTab.skipAccessLevel")}
              </FieldLabel>

              <Select
                items={accessLevelData}
                value={selectedNode.skipAccessLevel?.toString()}
                disabled={readOnly}
                onValueChange={(value) => {
                  if (value !== null) {
                    onSkipAccessLevelChange(value);
                  }
                }}
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
    </ServiceDeskSettingsLanguageEditor>
  );
}
