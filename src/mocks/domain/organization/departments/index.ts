import { DbDepartment } from "@/feature/organization/department";

import { internalCompanyMock } from "../companies";
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
    d_id: 0,
    d_name: internalCompanyMock.company_name,
    d_code: "C",
    d_description: internalCompanyMock.company_name,
    d_parent_id: null,
    d_active: true,
  },
  ...departmentsMock,
];
