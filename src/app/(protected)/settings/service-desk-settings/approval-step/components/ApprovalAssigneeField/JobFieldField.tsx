import { useMemo } from "react";
import { useTranslation } from "react-i18next";

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
import { SupportedLanguage } from "@/domain/config";
import { ApprovalAssigneeType, AssigneeByType } from "@/domain/serviceDesk";
import { useJobFieldListQuery } from "@/feature/organization/jobField";
import { NS } from "@/lib/i18n";
import { useLocalizedText } from "@/shared/hooks";
import { ValueLabel } from "@/shared/types";

type Props = {
  stepAssignee: AssigneeByType<"JOB_FIELD">;
  onChange: (value: ApprovalAssigneeType) => void;
  language: SupportedLanguage;
};

export function JobFieldField({ stepAssignee, onChange, language }: Props) {
  const { t } = useTranslation(NS.settings);
  const tLocal = useLocalizedText(language);
  const { data: jobFields } = useJobFieldListQuery({});

  const jobFieldData = useMemo((): Array<{
    groupLabel: string;
    items: ValueLabel[];
  }> => {
    if (!jobFields) return [];

    const jobFieldGroup = [];

    for (const jobField of jobFields) {
      const item = {
        value: jobField.id,
        label: tLocal(jobField.name),
      };
      if (jobField.parentId === "0") {
        jobFieldGroup.push({ groupLabel: item.label, items: [item] });
      } else {
        jobFieldGroup[jobFieldGroup.length - 1].items.push(item);
      }
    }

    return jobFieldGroup;
  }, [jobFields, language]);

  return (
    <Field className="col-span-2">
      <FieldLabel htmlFor="approval-select-job-field">
        {t("serviceDeskSettings.approvalStepTab.jobField")}
      </FieldLabel>
      <Select
        value={stepAssignee.jobFieldId}
        onValueChange={(value) =>
          onChange({ type: "JOB_FIELD", jobFieldId: value })
        }
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
              <SelectLabel className="bg-muted/50 text-xs rounded">
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
