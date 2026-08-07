import type { DbDepartment } from "@/lib/application/contracts/organization";

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
  ...departmentsMock,
  ...clientDepartmentsMock,
];
