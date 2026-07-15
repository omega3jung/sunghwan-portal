import { DbEmployee } from "@/feature/organization/employee";

import { clientEmployeeMock } from "./demoEmployee";
import { internalDemoEmployee } from "./demoUser";
import headOfficeEmployeeMock from "./portalOwner/headOffice.json";
import itEmployeeMock from "./portalOwner/it.json";
import logisticsEmployeeMock from "./portalOwner/logistics.json";
import repairCenterEmployeeMock from "./portalOwner/repairCenter.json";

export const employeesMock: DbEmployee[] = createEmployeesMock();

export const allDepartmentsMock: DbEmployee[] = [
  ...employeesMock,
  ...clientEmployeeMock,
];

export function createEmployeesMock(): DbEmployee[] {
  const employeemock = [
    ...headOfficeEmployeeMock,
    ...itEmployeeMock,
    ...repairCenterEmployeeMock,
    ...logisticsEmployeeMock,
  ].map((employee) => {
    const startDday = randomNumber(1000, 1);

    // currently working.
    if (employee.e_active) {
      return {
        ...employee,
        e_start_date: getBeforeDate(startDday),
      } as DbEmployee;
    }
    const endDday = randomNumber(startDday, 1);
    return {
      ...employee,
      e_start_date: getBeforeDate(startDday),
      e_end_date: getBeforeDate(endDday),
    } as DbEmployee;
  });

  return [...employeemock, ...internalDemoEmployee];
}

function randomNumber(num1: number, num2: number): number {
  const min = num1 > num2 ? num2 : num1;
  const max = num1 > num2 ? num1 : num2;

  const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;

  return randomNumber;
}

function getBeforeDate(num: number): Date {
  const now = new Date();

  const result = new Date(now);
  result.setDate(now.getDate() - num);

  return result;
}
