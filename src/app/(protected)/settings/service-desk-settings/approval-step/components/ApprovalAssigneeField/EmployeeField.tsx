import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { AvatarMultiComboBox } from "@/components/custom/AvatarMultiComboBox";
import { Field, FieldLabel } from "@/components/ui/field";
import { SupportedLanguage } from "@/domain/config";
import { ApprovalAssigneeType, AssigneeByType } from "@/domain/serviceDesk";
import { useEmployeeListQuery } from "@/feature/organization/employee";
import { useLocalizedValue } from "@/shared/hooks";
import { ImageValueLabel } from "@/shared/types";

import { MAX_ASSIGNEE_PER_APPROVAL } from "../../constants";

type EmployeeFieldProps = {
  stepAssignee: AssigneeByType<"EMPLOYEE">;
  onChange: (value: ApprovalAssigneeType) => void;
  language: SupportedLanguage;
};

export function EmployeeField({
  stepAssignee,
  onChange,
  language,
}: EmployeeFieldProps) {
  const { t } = useTranslation("settings");
  const tLocal = useLocalizedValue(language);
  const { data: employees } = useEmployeeListQuery({});

  const employeeData = useMemo((): ImageValueLabel[] => {
    if (!employees) return [];

    return employees.map((employee) => {
      const name = tLocal(employee.name);
      return {
        value: employee.id,
        label: `${name.first} ${name.last}`,
        displayName: employee.email,
        image: employee.imageUrl,
      };
    });
  }, [employees, tLocal]);

  return (
    <Field className="col-span-2">
      <FieldLabel htmlFor="approval-select-employee">
        {t("serviceDeskSettings.approvalStepTab.employee")}
      </FieldLabel>
      <AvatarMultiComboBox
        id="approval-select-employee"
        placeholderClassName="h-8 font-normal flex items-center pl-2 text-muted-foreground"
        variant={"ghost"}
        badgeVariant={"primary"}
        options={employeeData}
        value={stepAssignee.employeeIds}
        maxImages={MAX_ASSIGNEE_PER_APPROVAL}
        placeholder={t(
          "serviceDeskSettings.approvalStepTab.employeePlaceholder",
        )}
        onSelect={(e) => {
          if (e) {
            const current = stepAssignee;
            if (current.type !== "EMPLOYEE") return;

            const currentValue = [...current.employeeIds];
            currentValue.push(e);
            onChange({
              type: "EMPLOYEE",
              employeeIds: currentValue,
            });
          }
        }}
        onRemove={(e) => {
          const current = stepAssignee;
          if (current.type !== "EMPLOYEE") return;

          const currentValue = [...current.employeeIds];
          const currentValueindex = currentValue.indexOf(e);

          if (currentValueindex > -1) {
            currentValue.splice(currentValueindex, 1);
            onChange({
              type: "EMPLOYEE",
              employeeIds: currentValue,
            });
          } else {
            return;
          }
        }}
      />
    </Field>
  );
}
