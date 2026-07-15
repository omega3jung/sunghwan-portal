import { SupportedLanguage } from "@/domain/config";
import type { Department, Employee, JobField } from "@/domain/organization";
import {
  ApprovalAssigneeType,
  ApprovalAssigneeTypeValue,
  AssigneeByType,
} from "@/domain/serviceDesk";

import { DepartmentField } from "./DepartmentField";
import { EmployeeField } from "./EmployeeField";
import { JobFieldField } from "./JobFieldField";
import { ManagerField } from "./ManagerField";

type Props = {
  stepAssignee: AssigneeByType<ApprovalAssigneeTypeValue>;
  onChange: (value: ApprovalAssigneeType) => void;
  language: SupportedLanguage;
  readOnly?: boolean;
  employees?: Employee[];
  departments?: Department[];
  jobFields?: JobField[];
  isLoading?: boolean;
};

export function ApprovalAssigneeField({
  stepAssignee,
  onChange,
  language,
  readOnly = false,
  employees,
  departments,
  jobFields,
  isLoading = false,
}: Props) {
  switch (stepAssignee.type) {
    case "MANAGER":
      return (
        <ManagerField
          stepAssignee={stepAssignee}
          onChange={onChange}
          readOnly={readOnly}
        />
      );
    case "DEPARTMENT":
      return (
        <DepartmentField
          stepAssignee={stepAssignee}
          onChange={onChange}
          language={language}
          readOnly={readOnly}
          departments={departments}
          isLoading={isLoading}
        />
      );
    case "JOB_FIELD":
      return (
        <JobFieldField
          stepAssignee={stepAssignee}
          onChange={onChange}
          language={language}
          readOnly={readOnly}
          jobFields={jobFields}
          isLoading={isLoading}
        />
      );
    case "EMPLOYEE":
      return (
        <EmployeeField
          stepAssignee={stepAssignee}
          onChange={onChange}
          language={language}
          readOnly={readOnly}
          employees={employees}
          isLoading={isLoading}
        />
      );
  }
}
