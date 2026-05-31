import { EmployeeResponseDto } from "../employeesDto";
import { toEmployeeResponseDto } from "../employeesMapper";
import { findEmployeeByUsername } from "./employeeRepository";

export async function getEmployeeByUserName(
  userName: string,
): Promise<EmployeeResponseDto | null> {
  const employee = await findEmployeeByUsername(userName);

  if (!employee) {
    return null;
  }

  return toEmployeeResponseDto(employee);
}
