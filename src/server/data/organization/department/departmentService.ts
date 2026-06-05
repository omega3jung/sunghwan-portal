import { DepartmentDto } from "./departmentDto";
import { mapDepartmentRowsToDtos } from "./departmentMapper";
import { findActiveDepartmentRows } from "./departmentRepository";

export async function getActiveDepartments(): Promise<DepartmentDto[]> {
  const rows = await findActiveDepartmentRows();

  return mapDepartmentRowsToDtos(rows);
}
