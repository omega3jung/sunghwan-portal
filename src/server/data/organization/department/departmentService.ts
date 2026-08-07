import { DepartmentDto } from "./departmentDto";
import { mapDepartmentRowsToDtos } from "./departmentMapper";
import {
  findActiveDepartmentRows,
  findActiveDepartmentRowsByCompanyId,
} from "./departmentRepository";

/** Loads active departments through the server data boundary. */
export async function getActiveDepartments(): Promise<DepartmentDto[]> {
  const rows = await findActiveDepartmentRows();

  return mapDepartmentRowsToDtos(rows);
}

/** Loads active departments by company id through the server data boundary. */
export async function getActiveDepartmentsByCompanyId(
  companyId: number,
): Promise<DepartmentDto[]> {
  const rows = await findActiveDepartmentRowsByCompanyId(companyId);

  return mapDepartmentRowsToDtos(rows);
}
