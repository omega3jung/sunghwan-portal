import { Department } from "@/domain/organization";
import { ArrayMapper, LocalizedText } from "@/shared/types";

// back-end data structures.
export interface DbDepartment {
  department_id: string;
  department_name: LocalizedText;
  department_code?: string; // HR, IT, QC.
  department_description?: LocalizedText;
  department_parent_id: string | null;
  department_active: boolean;
}

export const camelDepartmentMapper: ArrayMapper<DbDepartment, Department> = (
  data,
) => {
  return data.map((item) => ({
    id: item.department_id,
    name: item.department_name,
    code: item.department_code,
    description: item.department_description,
    parentId: item.department_parent_id,
    active: item.department_active,
  }));
};

export const snakeDepartmentMapper: ArrayMapper<Department, DbDepartment> = (
  data,
) => {
  return data.map((item) => ({
    department_id: item.id,
    department_name: item.name,
    department_code: item.code,
    department_description: item.description,
    department_parent_id: item.parentId,
    department_active: item.active,
  }));
};
