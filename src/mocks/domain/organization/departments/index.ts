import { DbDepartment } from "@/feature/organization/department";

import { internalCompanyMock } from "../companies";
import { clientDepartmentsMock } from "./client";
import headOfficeDepartmentMock from "./portalOwner/headOffice.json";
import itDepartmentMock from "./portalOwner/it.json";
import logisticsDepartmentMock from "./portalOwner/logistics.json";
import repairCenterDepartmentMock from "./portalOwner/repairCenter.json";

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
    d_company_id: 1,
    d_parent_id: null,
    d_active: true,
  },
  ...departmentsMock,
  ...clientDepartmentsMock,
];
