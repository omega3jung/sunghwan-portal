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
import type { Department } from "@/domain/organization";
import { ApprovalAssigneeType, AssigneeByType } from "@/domain/serviceDesk";
import { SupportedLanguage } from "@/lib/application/i18n";
import { NS } from "@/lib/application/i18n";
import { useLocalizedText } from "@/lib/client/i18n";
import { ValueLabel } from "@/shared/types";

type Props = {
  stepAssignee: AssigneeByType<"DEPARTMENT">;
  onChange: (value: ApprovalAssigneeType) => void;
  language: SupportedLanguage;
  readOnly?: boolean;
  departments?: Department[];
  isLoading?: boolean;
};

export function DepartmentField({
  stepAssignee,
  onChange,
  language,
  readOnly,
  departments = [],
  isLoading,
}: Props) {
  const { t } = useTranslation(NS.settings);
  const tLocal = useLocalizedText(language);
  const departmentData = useMemo((): Array<{
    groupLabel: string;
    items: ValueLabel[];
  }> => {
    const departmentGroup: Array<{
      groupLabel: string;
      items: ValueLabel[];
    }> = [];

    for (const department of departments) {
      const item = {
        value: department.id,
        label: tLocal(department.name),
      };
      if (department.parentId === "0") {
        departmentGroup.push({ groupLabel: item.label, items: [item] });
      } else {
        const parentGroup = departmentGroup.find(
          (group) => group.items[0]?.value === department.parentId,
        );

        if (parentGroup) {
          parentGroup.items.push(item);
        } else {
          departmentGroup.push({ groupLabel: item.label, items: [item] });
        }
      }
    }

    if (
      stepAssignee.departmentId &&
      !departmentGroup.some((group) =>
        group.items.some((item) => item.value === stepAssignee.departmentId),
      )
    ) {
      departmentGroup.push({
        groupLabel: stepAssignee.departmentId,
        items: [
          {
            value: stepAssignee.departmentId,
            label: stepAssignee.departmentId,
          },
        ],
      });
    }

    return departmentGroup;
  }, [departments, stepAssignee.departmentId, tLocal]);

  return (
    <Field className="col-span-2">
      <FieldLabel htmlFor="approval-select-department">
        {t("serviceDeskSettings.approvalStepTab.department")}
      </FieldLabel>
      <Select
        value={stepAssignee.departmentId}
        disabled={readOnly || isLoading}
        onValueChange={(value) =>
          onChange({ type: "DEPARTMENT", departmentId: value })
        }
      >
        <SelectTrigger>
          <SelectValue
            placeholder={t(
              "serviceDeskSettings.approvalStepTab.departmentPlaceholder",
            )}
          />
        </SelectTrigger>
        <SelectContent id="approval-select-department">
          {departmentData.map((department) => (
            <SelectGroup key={`select_group_${department.items[0].value}`}>
              <SelectLabel className="bg-muted/50 text-xs rounded">
                {department.items[0].label}
              </SelectLabel>
              {department.items.map((item) => (
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
