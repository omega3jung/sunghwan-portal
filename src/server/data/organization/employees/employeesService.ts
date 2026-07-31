import { EmployeeResponseDto } from "./employeesDto";
import { toEmployeesResponseDto } from "./employeesMapper";
import {
  findEmployees,
  findEmployeesByCompanyId,
} from "./employeesRepository";

/** Loads employees through the server data boundary. */
export async function getEmployees(
  active: boolean,
): Promise<EmployeeResponseDto[]> {
  const employee = await findEmployees(active);

  return toEmployeesResponseDto(employee);
}

/** Loads employees by company id through the server data boundary. */
export async function getEmployeesByCompanyId(
  active: boolean,
  companyId: number,
): Promise<EmployeeResponseDto[]> {
  const rows = await findEmployeesByCompanyId(active, companyId);

  return toEmployeesResponseDto(rows);
}
