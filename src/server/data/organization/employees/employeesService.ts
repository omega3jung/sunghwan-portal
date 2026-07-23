import { EmployeeResponseDto } from "./employeesDto";
import { toEmployeesResponseDto } from "./employeesMapper";
import {
  findEmployees,
  findEmployeesByCompanyId,
} from "./employeesRepository";

export async function getEmployees(
  active: boolean,
): Promise<EmployeeResponseDto[]> {
  const employee = await findEmployees(active);

  return toEmployeesResponseDto(employee);
}

export async function getEmployeesByCompanyId(
  active: boolean,
  companyId: number,
): Promise<EmployeeResponseDto[]> {
  const rows = await findEmployeesByCompanyId(active, companyId);

  return toEmployeesResponseDto(rows);
}
