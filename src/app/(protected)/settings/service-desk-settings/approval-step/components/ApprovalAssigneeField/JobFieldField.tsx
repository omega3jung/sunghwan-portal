import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { HierarchicalSelect } from "@/components/custom/HierarchicalSelect";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Department, JobField } from "@/domain/organization";
import { ApprovalAssigneeType, AssigneeByType } from "@/domain/serviceDesk";
import { SupportedLanguage } from "@/lib/application/i18n";
import { NS } from "@/lib/application/i18n";
import { useLocalizedText } from "@/lib/client/i18n";
import { ValueLabel } from "@/shared/types";

import { buildJobFieldItems } from "../../../utils/jobFieldItems";

type Props = {
  stepAssignee: AssigneeByType<"JOB_FIELD">;
  onChange: (value: ApprovalAssigneeType) => void;
  language: SupportedLanguage;
  canEdit?: boolean;
  departments?: Department[];
  jobFields?: JobField[];
  isLoading?: boolean;
};

export function JobFieldField({
  stepAssignee,
  onChange,
  language,
  canEdit = true,
  departments = [],
  jobFields = [],
  isLoading,
}: Props) {
  const { t } = useTranslation(NS.settings);
  const tLocal = useLocalizedText(language);
  const jobFieldItems = useMemo(
    () =>
      buildJobFieldItems({
        departments,
        jobFields,
        selectedJobFieldIds: stepAssignee.jobFieldId
          ? [stepAssignee.jobFieldId]
          : [],
        getLocalizedText: tLocal,
        fallbackDepartmentLabel: t(
          "serviceDeskSettings.approvalStepTab.department",
        ),
      }),
    [departments, jobFields, stepAssignee.jobFieldId, t, tLocal],
  );

  return (
    <Field className="col-span-2">
      <FieldLabel htmlFor="approval-select-job-field">
        {t("serviceDeskSettings.approvalStepTab.jobField")}
      </FieldLabel>
      <HierarchicalSelect
        id="approval-select-job-field"
        value={stepAssignee.jobFieldId}
        items={jobFieldItems}
        placeholder={t(
          "serviceDeskSettings.approvalStepTab.jobFieldPlaceholder",
        )}
        backLabel={t("action.back", { ns: NS.common })}
        emptyText={t("empty.withItem", {
          ns: NS.common,
          item: t("serviceDeskSettings.approvalStepTab.jobField"),
        })}
        selectableStrategy="leaf-only"
        disabled={!canEdit || isLoading}
        onValueChange={(jobFieldId) =>
          onChange({ type: "JOB_FIELD", jobFieldId })
        }
      />
    </Field>
  );
}

export function LegacyJobFieldField({
  stepAssignee,
  onChange,
  language,
  canEdit = true,
  jobFields = [],
  isLoading,
}: Props) {
  const { t } = useTranslation(NS.settings);
  const tLocal = useLocalizedText(language);
  const jobFieldData = useMemo((): Array<{
    groupLabel: string;
    items: ValueLabel[];
  }> => {
    const jobFieldGroup: Array<{
      groupLabel: string;
      items: ValueLabel[];
    }> = [];

    for (const jobField of jobFields) {
      const item = {
        value: jobField.id,
        label: tLocal(jobField.name),
      };
      if (jobField.parentId === "0") {
        jobFieldGroup.push({ groupLabel: item.label, items: [item] });
      } else {
        const parentGroup = jobFieldGroup.find(
          (group) => group.items[0]?.value === jobField.parentId,
        );

        if (parentGroup) {
          parentGroup.items.push(item);
        } else {
          jobFieldGroup.push({ groupLabel: item.label, items: [item] });
        }
      }
    }

    if (
      stepAssignee.jobFieldId &&
      !jobFieldGroup.some((group) =>
        group.items.some((item) => item.value === stepAssignee.jobFieldId),
      )
    ) {
      jobFieldGroup.push({
        groupLabel: stepAssignee.jobFieldId,
        items: [
          {
            value: stepAssignee.jobFieldId,
            label: stepAssignee.jobFieldId,
          },
        ],
      });
    }

    return jobFieldGroup;
  }, [jobFields, stepAssignee.jobFieldId, tLocal]);

  return (
    <Field className="col-span-2">
      <FieldLabel htmlFor="approval-select-job-field">
        {t("serviceDeskSettings.approvalStepTab.jobField")}
      </FieldLabel>
      <Select
        value={stepAssignee.jobFieldId}
        disabled={!canEdit || isLoading}
        onValueChange={(value) => {
          if (value !== null) {
            onChange({ type: "JOB_FIELD", jobFieldId: value });
          }
        }}
      >
        <SelectTrigger>
          <SelectValue
            placeholder={t(
              "serviceDeskSettings.approvalStepTab.jobFieldPlaceholder",
            )}
          />
        </SelectTrigger>
        <SelectContent id="approval-select-job-field">
          {jobFieldData.map((jobField) => (
            <SelectGroup key={`select_group_${jobField.items[0].value}`}>
              <SelectLabel className="rounded bg-muted/50">
                {jobField.items[0].label}
              </SelectLabel>
              {jobField.items.map((item) => (
                <SelectItem
                  className="text-xs ml-2"
                  key={`select_item_${item.value}`}
                  value={item.value}
                >
                  {item.label}
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}
