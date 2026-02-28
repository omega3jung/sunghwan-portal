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
import { useFetchDepartment } from "@/feature/organization/department";
import { ValueLabel } from "@/shared/types";

type Props = {
  stepAssignee: AssigneeByType<"DEPARTMENT">;
  onChange: (value: ApprovalAssigneeType) => void;
  language: SupportedLanguage;
};

export function DepartmentField({ stepAssignee, onChange, language }: Props) {
  const { t } = useTranslation("settings");
  const { data: departments } = useFetchDepartment({});

  const departmentData = useMemo((): Array<{
    groupLabel: string;
    items: ValueLabel[];
  }> => {
    if (!departments) return [];

    const departmentGroup = [];

    for (const department of departments) {
      const item = {
        value: department.id,
        label: department.name[language] || department.name["en"],
      };
      if (department.parentId === "0") {
        departmentGroup.push({ groupLabel: item.label, items: [item] });
      } else {
        departmentGroup[departmentGroup.length - 1].items.push(item);
      }
    }

    return departmentGroup;
  }, [departments, language]);

  return (
    <Field className="col-span-2">
      <FieldLabel htmlFor="approval-select-department">
        {t("itServiceDeskSettings.approvalStepTab.department")}
      </FieldLabel>
      <Select
        value={stepAssignee.departmentId}
        onValueChange={(value) =>
          onChange({ type: "DEPARTMENT", departmentId: value })
        }
      >
        <SelectTrigger>
          <SelectValue
            placeholder={t(
              "itServiceDeskSettings.approvalStepTab.departmentPlaceholder",
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
