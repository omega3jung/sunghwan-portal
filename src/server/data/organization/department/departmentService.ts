import { DepartmentDto } from "./departmentDto";
import { mapDepartmentRowsToDtos } from "./departmentMapper";
import {
  findActiveDepartmentRows,
  findActiveDepartmentRowsByCompanyId,
} from "./departmentRepository";

export async function getActiveDepartments(): Promise<DepartmentDto[]> {
  const rows = await findActiveDepartmentRows();

  return mapDepartmentRowsToDtos(rows);
}

export async function getActiveDepartmentsByCompanyId(
  companyId: number,
): Promise<DepartmentDto[]> {
  const rows = await findActiveDepartmentRowsByCompanyId(companyId);

  return mapDepartmentRowsToDtos(rows);
}
