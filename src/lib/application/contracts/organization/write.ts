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
/** Input contract for create company operations at the organization application boundary. */
export type CreateCompanyInput = CompanyWriteFields & { id?: string };
/** Input contract for update company operations at the organization application boundary. */
export type UpdateCompanyInput = CompanyWriteFields & { id: string };

/** Converts company input into the API write payload. */
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

type DepartmentWriteFields = Pick<
  Department,
  "name" | "code" | "description" | "companyId" | "parentId" | "active"
>;
/** Input contract for create department operations at the organization application boundary. */
export type CreateDepartmentInput = DepartmentWriteFields & { id?: string };
/** Input contract for update department operations at the organization application boundary. */
export type UpdateDepartmentInput = DepartmentWriteFields & { id: string };

/** Converts department input into the API write payload. */
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

type JobFieldWriteFields = Pick<
  JobField,
  "name" | "description" | "companyId" | "departmentId" | "parentId" | "active"
>;
/** Input contract for create job field operations at the organization application boundary. */
export type CreateJobFieldInput = JobFieldWriteFields & { id?: string };
/** Input contract for update job field operations at the organization application boundary. */
export type UpdateJobFieldInput = JobFieldWriteFields & { id: string };

/** Converts job field input into the API write payload. */
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

type DateInput = Date | string;
type EmployeeWriteFields = Omit<Employee, "id" | "startDate" | "endDate"> & {
  startDate: DateInput;
  endDate?: DateInput;
};
/** Input contract for create employee operations at the organization application boundary. */
export type CreateEmployeeInput = EmployeeWriteFields & {
  id?: number | string;
};
/** Input contract for update employee operations at the organization application boundary. */
export type UpdateEmployeeInput = EmployeeWriteFields & {
  id: number | string;
};

/** Converts employee input into the API write payload. */
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

function resolveEmployeeId(value: number | string | undefined) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  return typeof value === "string" ? idToNumber(value) : null;
}
