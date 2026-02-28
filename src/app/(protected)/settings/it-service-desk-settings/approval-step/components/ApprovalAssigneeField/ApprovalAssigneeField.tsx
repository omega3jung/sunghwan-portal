import { SupportedLanguage } from "@/domain/config";
import {
  ApprovalAssigneeType,
  ApprovalAssigneeTypeValue,
  AssigneeByType,
} from "@/domain/itServiceDesk";

import { DepartmentField } from "./DepartmentField";
import { EmployeeField } from "./EmployeeField";
import { JobFieldField } from "./JobFieldField";
import { ManagerField } from "./ManagerField";

type Props = {
  stepAssignee: AssigneeByType<ApprovalAssigneeTypeValue>;
  onChange: (value: ApprovalAssigneeType) => void;
  language: SupportedLanguage;
};

export function ApprovalAssigneeField({
  stepAssignee,
  onChange,
  language,
}: Props) {
  switch (stepAssignee.type) {
    case "MANAGER":
      return <ManagerField stepAssignee={stepAssignee} onChange={onChange} />;
    case "DEPARTMENT":
      return (
        <DepartmentField
          stepAssignee={stepAssignee}
          onChange={onChange}
          language={language}
        />
      );
    case "JOB_FIELD":
      return (
        <JobFieldField
          stepAssignee={stepAssignee}
          onChange={onChange}
          language={language}
        />
      );
    case "EMPLOYEE":
      return (
        <EmployeeField
          stepAssignee={stepAssignee}
          onChange={onChange}
          language={language}
        />
      );
  }
}
