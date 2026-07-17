import type { DbEmployee } from "@/feature/organization/employee";

import { clientEmployeesMockData } from "./client";
import { internalDemoEmployee } from "./demoUser";
import headOfficeEmployeeMock from "./portalOwner/headOffice.json";
import itEmployeeMock from "./portalOwner/it.json";
import logisticsEmployeeMock from "./portalOwner/logistics.json";
import repairCenterEmployeeMock from "./portalOwner/repairCenter.json";

const portalOwnerEmployeesMock: DbEmployee[] = [
  ...headOfficeEmployeeMock,
  ...itEmployeeMock,
  ...repairCenterEmployeeMock,
  ...logisticsEmployeeMock,
].map((employee) => ({
  ...employee,
  e_start_date: new Date(employee.e_start_date),
  e_end_date:
    employee.e_end_date === null ? null : new Date(employee.e_end_date),
}));

const clientEmployeesMock: DbEmployee[] = clientEmployeesMockData.map(
  (employee) => ({
    ...employee,
    e_start_date: new Date(employee.e_start_date),
    e_end_date:
      employee.e_end_date === null ? null : new Date(employee.e_end_date),
  }),
);

export const employeesMock: DbEmployee[] = [
  ...portalOwnerEmployeesMock,
  ...internalDemoEmployee,
];

export const allEmployeesMock: DbEmployee[] = [
  ...portalOwnerEmployeesMock,
  ...internalDemoEmployee,
  ...clientEmployeesMock,
];
