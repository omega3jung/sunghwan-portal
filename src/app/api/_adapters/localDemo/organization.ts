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
  toCompanyMockResource,
  toDepartmentMockResource,
  toEmployeeMockResource,
  toJobFieldMockResource,
  type UpdateCompanyInput,
  type UpdateDepartmentInput,
  type UpdateEmployeeInput,
  type UpdateJobFieldInput,
} from "@/lib/application/contracts/organization";
import { allCompaniesMock } from "@/mocks/domain/organization/companies";
import { allDepartmentsMock } from "@/mocks/domain/organization/departments";
import { allEmployeesMock } from "@/mocks/domain/organization/employee";
import { allJobFieldsMock } from "@/mocks/domain/organization/jobFields";

export function listLocalCompanies() {
  const items = camelCompanyMapper(
    allCompaniesMock
      .filter((company) => company.company_active)
      .sort(compareCompanies),
  );
  return { items, total: items.length };
}

export function getLocalCompany(id: string) {
  return (
    camelCompanyMapper(
      allCompaniesMock.filter((item) => String(item.company_id) === id),
    )[0] ?? null
  );
}

export const createLocalCompany = (input: CreateCompanyInput) =>
  toCompanyMockResource(input);
export const updateLocalCompany = (input: UpdateCompanyInput, id: string) =>
  toCompanyMockResource(input, id);

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

export function getLocalDepartment(id: string) {
  return (
    camelDepartmentMapper(allDepartmentsMock).find((item) => item.id === id) ??
    null
  );
}

export const createLocalDepartment = (input: CreateDepartmentInput) =>
  toDepartmentMockResource(input);
export const updateLocalDepartment = (
  input: UpdateDepartmentInput,
  id: string,
) => toDepartmentMockResource(input, id);

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

export function getLocalEmployee(id: string) {
  return (
    camelEmployeeMapper(allEmployeesMock).find(
      (item) => item.id === Number(id),
    ) ??
    null
  );
}

export const createLocalEmployee = (input: CreateEmployeeInput) =>
  toEmployeeMockResource(input);
export const updateLocalEmployee = (input: UpdateEmployeeInput, id: string) =>
  toEmployeeMockResource(input, id);

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

export function getLocalJobField(id: string) {
  return (
    camelJobFieldMapper(allJobFieldsMock).find((item) => item.id === id) ?? null
  );
}

export const createLocalJobField = (input: CreateJobFieldInput) =>
  toJobFieldMockResource(input);
export const updateLocalJobField = (input: UpdateJobFieldInput, id: string) =>
  toJobFieldMockResource(input, id);

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
