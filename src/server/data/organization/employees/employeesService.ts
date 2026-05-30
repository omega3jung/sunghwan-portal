import { EmployeeResponseDto } from "./employeesDto";
import { toEmployeesResponseDto } from "./employeesMapper";
import { findEmployees } from "./employeesRepository";

export async function getEmployees(
  active: boolean,
): Promise<EmployeeResponseDto[]> {
  const employee = await findEmployees(active);

  return toEmployeesResponseDto(employee);
}
