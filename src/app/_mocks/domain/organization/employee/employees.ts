import { DbEmployee } from "@/api/organization/employee/mapper";

import headOfficeEmployeeMock from "./headOffice.json";
import itEmployeeMock from "./it.json";
import logisticsEmployeeMock from "./logistics.json";
import repairCenterEmployeeMock from "./repairCenter.json";

export function createEmployeesMock(): DbEmployee[] {
  const employeemock = [
    ...headOfficeEmployeeMock,
    ...itEmployeeMock,
    ...repairCenterEmployeeMock,
    ...logisticsEmployeeMock,
  ].map((employee) => {
    const startDday = randomNumber(1000, 1);

    // currently working.
    if (employee.employee_active) {
      return {
        ...employee,
        employee_start_date: getBeforeDate(startDday),
      } as DbEmployee;
    }
    const endDday = randomNumber(startDday, 1);
    return {
      ...employee,
      employee_start_date: getBeforeDate(startDday),
      employee_end_date: getBeforeDate(endDday),
    } as DbEmployee;
  });

  return employeemock;
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
