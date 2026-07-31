import type {
  Company,
  Department,
  Employee,
  JobField,
} from "@/domain/organization";
import { idToNumber } from "@/lib/application/api/mapId";
import {
  applyRuleGroupFilter,
  parseRuleGroupFilter,
} from "@/lib/application/api/query";
import {
  camelCompanyMapper,
  camelDepartmentMapper,
  camelEmployeeMapper,
  camelJobFieldMapper,
  type CreateCompanyInput,
  type CreateDepartmentInput,
  type CreateEmployeeInput,
  type CreateJobFieldInput,
  type UpdateCompanyInput,
  type UpdateDepartmentInput,
  type UpdateEmployeeInput,
  type UpdateJobFieldInput,
} from "@/lib/application/contracts/organization";
import { allCompaniesMock } from "@/mocks/domain/organization/companies";
import { allDepartmentsMock } from "@/mocks/domain/organization/departments";
import { allEmployeesMock } from "@/mocks/domain/organization/employee";
import { allJobFieldsMock } from "@/mocks/domain/organization/jobFields";

/** Returns companies from the server-side LOCAL organization adapter. */
export function listLocalCompanies() {
  const items = camelCompanyMapper(
    allCompaniesMock
      .filter((company) => company.company_active)
      .sort(compareCompanies),
  );
  return { items, total: items.length };
}

/** Returns company from the server-side LOCAL organization adapter. */
export function getLocalCompany(id: string) {
  return (
    camelCompanyMapper(
      allCompaniesMock.filter((item) => String(item.company_id) === id),
    )[0] ?? null
  );
}

/** Creates company in the server-side LOCAL organization adapter mutable state. */
export const createLocalCompany = (input: CreateCompanyInput) =>
  toLocalCompany(input);
/** Updates company in the server-side LOCAL organization adapter mutable state. */
export const updateLocalCompany = (input: UpdateCompanyInput, id: string) =>
  toLocalCompany(input, id);

/** Returns departments from the server-side LOCAL organization adapter. */
export function listLocalDepartments(searchParams: URLSearchParams) {
  const items = camelDepartmentMapper(
    applyRuleGroupFilter(
      allDepartmentsMock.map((department) => ({
        ...department,
        companyId: department.d_company_id,
      })),
      parseRuleGroupFilter(searchParams.get("filter")),
    ),
  );
  return { items, total: items.length };
}

/** Returns department from the server-side LOCAL organization adapter. */
export function getLocalDepartment(id: string) {
  return (
    camelDepartmentMapper(allDepartmentsMock).find((item) => item.id === id) ??
    null
  );
}

/** Creates department in the server-side LOCAL organization adapter mutable state. */
export const createLocalDepartment = (input: CreateDepartmentInput) =>
  toLocalDepartment(input);
/** Updates department in the server-side LOCAL organization adapter mutable state. */
export const updateLocalDepartment = (
  input: UpdateDepartmentInput,
  id: string,
) => toLocalDepartment(input, id);

/** Returns employees from the server-side LOCAL organization adapter. */
export function listLocalEmployees(searchParams: URLSearchParams) {
  const data = camelEmployeeMapper(
    applyRuleGroupFilter(
      allEmployeesMock.map((employee) => ({
        ...employee,
        companyId: employee.e_company_id,
      })),
      parseRuleGroupFilter(searchParams.get("filter")),
    ),
  );
  return { data };
}

/** Returns employee from the server-side LOCAL organization adapter. */
export function getLocalEmployee(id: string) {
  return (
    camelEmployeeMapper(allEmployeesMock).find(
      (item) => item.id === Number(id),
    ) ??
    null
  );
}

/** Creates employee in the server-side LOCAL organization adapter mutable state. */
export const createLocalEmployee = (input: CreateEmployeeInput) =>
  toLocalEmployee(input);
/** Updates employee in the server-side LOCAL organization adapter mutable state. */
export const updateLocalEmployee = (input: UpdateEmployeeInput, id: string) =>
  toLocalEmployee(input, id);

/** Returns job fields from the server-side LOCAL organization adapter. */
export function listLocalJobFields(searchParams: URLSearchParams) {
  const companyIdByDepartmentId = new Map(
    allDepartmentsMock.map((department) => [
      department.d_id,
      department.d_company_id,
    ]),
  );
  const items = camelJobFieldMapper(
    applyRuleGroupFilter(
      allJobFieldsMock.map((jobField) => ({
        ...jobField,
        companyId: companyIdByDepartmentId.get(jobField.jf_department_id),
      })),
      parseRuleGroupFilter(searchParams.get("filter")),
    ),
  );
  return { items, total: items.length };
}

/** Returns job field from the server-side LOCAL organization adapter. */
export function getLocalJobField(id: string) {
  return (
    camelJobFieldMapper(allJobFieldsMock).find((item) => item.id === id) ?? null
  );
}

/** Creates job field in the server-side LOCAL organization adapter mutable state. */
export const createLocalJobField = (input: CreateJobFieldInput) =>
  toLocalJobField(input);
/** Updates job field in the server-side LOCAL organization adapter mutable state. */
export const updateLocalJobField = (input: UpdateJobFieldInput, id: string) =>
  toLocalJobField(input, id);

function toLocalCompany(
  input: CreateCompanyInput | UpdateCompanyInput,
  id = Date.now().toString(),
): Company {
  return { id, ...input };
}

function toLocalDepartment(
  input: CreateDepartmentInput | UpdateDepartmentInput,
  id = Date.now().toString(),
): Department {
  return { id, ...input };
}

function toLocalJobField(
  input: CreateJobFieldInput | UpdateJobFieldInput,
  id = Date.now().toString(),
): JobField {
  return { id, ...input };
}

function toLocalEmployee(
  input: CreateEmployeeInput | UpdateEmployeeInput,
  id: number | string = Date.now(),
): Employee {
  const { startDate, endDate, ...rest } = input;

  return {
    ...rest,
    id: resolveEmployeeId(id) ?? Date.now(),
    startDate: toDate(startDate),
    ...(endDate ? { endDate: toDate(endDate) } : {}),
  };
}

function resolveEmployeeId(value: number | string | undefined) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  return typeof value === "string" ? idToNumber(value) : null;
}

function toDate(value: Date | string) {
  return value instanceof Date ? value : new Date(value);
}

function compareCompanies(
  a: (typeof allCompaniesMock)[number],
  b: (typeof allCompaniesMock)[number],
) {
  if (a.company_portal_owner !== b.company_portal_owner) {
    return Number(a.company_portal_owner) - Number(b.company_portal_owner);
  }

  return (
    (a.company_name.en ?? "").localeCompare(b.company_name.en ?? "") ||
    (a.company_code ?? "").localeCompare(b.company_code ?? "") ||
    a.company_id - b.company_id
  );
}
