import { DbDepartment } from "@/feature/organization/department/mapper";

import headOfficeDepartmentMock from "./headOffice.json";
import itDepartmentMock from "./it.json";
import logisticsDepartmentMock from "./logistics.json";
import repairCenterDepartmentMock from "./repairCenter.json";

export const departmentsMock: DbDepartment[] = [
  ...headOfficeDepartmentMock,
  ...itDepartmentMock,
  ...repairCenterDepartmentMock,
  ...logisticsDepartmentMock,
];

export const allDepartmentsMock: DbDepartment[] = [
  /*  Company  */
  {
    department_id: 0,
    department_name: { en: "Company" },
    department_code: "C",
    department_description: { en: "Company" },
    department_parent_id: null,
    department_active: true,
  },
  ...departmentsMock,
];
