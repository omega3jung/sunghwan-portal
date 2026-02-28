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
import { ApprovalAssigneeType, AssigneeByType } from "@/domain/itServiceDesk";
import { useFetchJobField } from "@/feature/organization/jobField";
import { ValueLabel } from "@/shared/types";

type Props = {
  stepAssignee: AssigneeByType<"JOB_FIELD">;
  onChange: (value: ApprovalAssigneeType) => void;
  language: SupportedLanguage;
};

export function JobFieldField({ stepAssignee, onChange, language }: Props) {
  const { t } = useTranslation("settings");
  const { data: jobFields } = useFetchJobField({});

  const jobFieldData = useMemo((): Array<{
    groupLabel: string;
    items: ValueLabel[];
  }> => {
    if (!jobFields) return [];

    const jobFieldGroup = [];

    for (const jobField of jobFields) {
      const item = {
        value: jobField.id,
        label: jobField.name[language] || jobField.name["en"],
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
        {t("itServiceDeskSettings.approvalStepTab.jobField")}
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
              "itServiceDeskSettings.approvalStepTab.jobFieldPlaceholder",
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
