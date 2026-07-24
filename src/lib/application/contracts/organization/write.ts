import type {
  Company,
  Department,
  Employee,
  JobField,
} from "@/domain/organization";
import { idToNumber } from "@/lib/application/api/mapId";
import { undefinedToNull } from "@/shared/utils/value";

import type { DbCompany } from "./company";
import type { DbDepartment } from "./department";
import type { DbEmployee } from "./employee";
import type { DbJobField } from "./jobField";

type CompanyWriteFields = Pick<
  Company,
  "name" | "code" | "isPortalOwner" | "active"
>;
export type CreateCompanyInput = CompanyWriteFields & { id?: string };
export type UpdateCompanyInput = CompanyWriteFields & { id: string };

export function toCompanyWritePayload(
  input: CreateCompanyInput | UpdateCompanyInput,
): Omit<DbCompany, "company_id" | "company_code"> & {
  company_id?: number | null;
  company_code?: string | null;
} {
  return {
    company_id: idToNumber(input.id),
    company_name: input.name,
    company_code: undefinedToNull(input.code),
    company_portal_owner: input.isPortalOwner,
    company_active: input.active,
  };
}

export function toCompanyMockResource(
  input: CreateCompanyInput | UpdateCompanyInput,
  id = Date.now().toString(),
): Company {
  return { id, ...input };
}

type DepartmentWriteFields = Pick<
  Department,
  "name" | "code" | "description" | "companyId" | "parentId" | "active"
>;
export type CreateDepartmentInput = DepartmentWriteFields & { id?: string };
export type UpdateDepartmentInput = DepartmentWriteFields & { id: string };

export function toDepartmentWritePayload(
  input: CreateDepartmentInput | UpdateDepartmentInput,
): Omit<DbDepartment, "d_id"> & { d_id?: number | null } {
  return {
    d_id: idToNumber(input.id),
    d_name: input.name,
    d_code: undefinedToNull(input.code),
    d_description: undefinedToNull(input.description),
    d_company_id: Number(input.companyId),
    d_parent_id: idToNumber(input.parentId),
    d_active: input.active,
  };
}

export function toDepartmentMockResource(
  input: CreateDepartmentInput | UpdateDepartmentInput,
  id = Date.now().toString(),
): Department {
  return { id, ...input };
}

type JobFieldWriteFields = Pick<
  JobField,
  "name" | "description" | "companyId" | "departmentId" | "parentId" | "active"
>;
export type CreateJobFieldInput = JobFieldWriteFields & { id?: string };
export type UpdateJobFieldInput = JobFieldWriteFields & { id: string };

export function toJobFieldWritePayload(
  input: CreateJobFieldInput | UpdateJobFieldInput,
): Omit<DbJobField, "jf_id"> & { jf_id?: number | null } {
  return {
    jf_id: idToNumber(input.id),
    jf_name: input.name,
    jf_description: undefinedToNull(input.description),
    jf_department_id: Number(input.departmentId),
    jf_company_id: Number(input.companyId),
    jf_parent_id: idToNumber(input.parentId),
    jf_active: input.active,
  };
}

export function toJobFieldMockResource(
  input: CreateJobFieldInput | UpdateJobFieldInput,
  id = Date.now().toString(),
): JobField {
  return { id, ...input };
}

type DateInput = Date | string;
type EmployeeWriteFields = Omit<Employee, "id" | "startDate" | "endDate"> & {
  startDate: DateInput;
  endDate?: DateInput;
};
export type CreateEmployeeInput = EmployeeWriteFields & {
  id?: number | string;
};
export type UpdateEmployeeInput = EmployeeWriteFields & {
  id: number | string;
};

export function toEmployeeWritePayload(
  input: CreateEmployeeInput | UpdateEmployeeInput,
): Omit<DbEmployee, "e_id" | "e_start_date" | "e_end_date"> & {
  e_id?: number | null;
  e_start_date: DateInput;
  e_end_date: DateInput | null;
} {
  return {
    e_id: resolveEmployeeId(input.id),
    e_username: input.username,
    e_name: input.name,
    e_phone: input.phone,
    e_email: input.email,
    e_image_url: undefinedToNull(input.imageUrl),
    e_department_id: Number(input.departmentId),
    e_job_field_id: Number(input.jobFieldId),
    e_company_id: Number(input.companyId),
    e_start_date: input.startDate,
    e_end_date: undefinedToNull(input.endDate),
    e_work_shift_id: idToNumber(input.shiftId),
    e_active: input.active,
    e_engineer_id: idToNumber(input.engineerId),
    e_rf_tag_id: undefinedToNull(input.rfTagId),
    e_hour_rate: undefinedToNull(input.hourRate),
  };
}

export function toEmployeeMockResource(
  input: CreateEmployeeInput | UpdateEmployeeInput,
  id: number | string = Date.now(),
): Employee {
  const { startDate, endDate, ...rest } = input;

  return {
    ...rest,
    id: resolveEmployeeId(id) ?? Date.now(),
    startDate: toDateValue(startDate),
    ...(endDate ? { endDate: toDateValue(endDate) } : {}),
  };
}

function resolveEmployeeId(value: number | string | undefined) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  return typeof value === "string" ? idToNumber(value) : null;
}

function toDateValue(value: DateInput) {
  return value instanceof Date ? value : new Date(value);
}
