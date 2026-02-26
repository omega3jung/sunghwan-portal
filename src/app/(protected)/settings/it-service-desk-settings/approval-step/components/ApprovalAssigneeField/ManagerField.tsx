import { useTranslation } from "react-i18next";

import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ApprovalAssigneeType, AssigneeByType } from "@/domain/itServiceDesk";

type Props = {
  stepAssignee: AssigneeByType<"MANAGER">;
  onChange: (value: ApprovalAssigneeType) => void;
};

export function ManagerField({ stepAssignee, onChange }: Props) {
  const { t } = useTranslation("settings");

  return (
    <Field className="col-span-2">
      <FieldLabel htmlFor="approval-select-manager-level">
        {t("itServiceDeskSettings.approvalStepTab.managerLevel")}
      </FieldLabel>
      <Input
        id="start-index-input"
        className="w-20"
        value={stepAssignee.level}
        onChange={(e) => {
          const number = parseInt(e.target.value);
          onChange({ type: "MANAGER", level: number > 1 ? 2 : 1 });
        }}
        type={"number"}
        min={1}
        max={2}
      />
    </Field>
  );
}
