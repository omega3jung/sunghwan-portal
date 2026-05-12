import { EmployeeResponseDto } from "./employeeDto";
import { toEmployeeResponseDto } from "./employeeMapper";
import {
  findActiveEmployeeById,
  findActiveEmployeeByUserName,
  findEmployeeById,
} from "./employeeRepository";

export async function getEmployeeById(
  employeeId: number,
): Promise<EmployeeResponseDto | null> {
  const employee = await findEmployeeById(employeeId);

  if (!employee) {
    return null;
  }

  return toEmployeeResponseDto(employee);
}

export async function getActiveEmployeeByUserName(
  userName: string,
): Promise<EmployeeResponseDto | null> {
  const employee = await findActiveEmployeeByUserName(userName);

  if (!employee) {
    return null;
  }

  return toEmployeeResponseDto(employee);
}

export async function getActiveEmployeeById(
  employeeId: number,
): Promise<EmployeeResponseDto | null> {
  const employee = await findActiveEmployeeById(employeeId);

  if (!employee) {
    return null;
  }

  return toEmployeeResponseDto(employee);
}
