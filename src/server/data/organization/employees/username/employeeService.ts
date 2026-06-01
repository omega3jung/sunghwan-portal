import { EmployeeResponseDto } from "../employeesDto";
import { toEmployeeResponseDto } from "../employeesMapper";
import { findEmployeeByUsername } from "./employeeRepository";

export async function getEmployeeByUserName(
  username: string,
): Promise<EmployeeResponseDto | null> {
  const employee = await findEmployeeByUsername(username);

  if (!employee) {
    return null;
  }

  return toEmployeeResponseDto(employee);
}
