import type { DbCompany } from "@/feature/organization/company";
import type { DbEmployee } from "@/feature/organization/employee";

import { clientCompaniesMock } from "../companies";
import headOfficeEmployeeMock from "./portalOwner/headOffice.json";
import itEmployeeMock from "./portalOwner/it.json";

type SourceEmployee = Omit<DbEmployee, "e_start_date">;

type CommonEmployeeSource = {
  sourceEmployeeId: number;
  departmentId: number;
  jobFieldId: number;
  startDate: string;
};

const createDemoDepartmentId = (companyIndex: number, departmentId: number) =>
  100 + companyIndex * 10 + departmentId;

const createDemoJobFieldId = (companyIndex: number, jobFieldId: number) =>
  1000 + companyIndex * 100 + jobFieldId;

const createDemoEmployeeId = (companyIndex: number, employeeId: number) =>
  10000 + companyIndex * 100 + employeeId;

const createUtcDate = (date: string) => new Date(`${date}T00:00:00.000Z`);

const portalOwnerEmployeeMockData = [
  ...headOfficeEmployeeMock,
  ...itEmployeeMock,
] as SourceEmployee[];

const portalOwnerEmployeeById = new Map(
  portalOwnerEmployeeMockData.map((employee) => [employee.e_id, employee]),
);

function getPortalOwnerEmployee(employeeId: number): SourceEmployee {
  const employee = portalOwnerEmployeeById.get(employeeId);

  if (!employee) {
    throw new Error(`[employee mock] Missing portal owner employee ${employeeId}.`);
  }

  return employee;
}

function createCompanyScopedUsername(
  company: DbCompany,
  employee: DbEmployee,
) {
  return `${employee.e_username}_c${company.company_id}`;
}

function createCompanyScopedEmail(company: DbCompany, email: string) {
  const atIndex = email.lastIndexOf("@");
  const companySuffix = `c${company.company_id}`;

  if (atIndex < 0) {
    return `${email}.${companySuffix}`;
  }

  return `${email.slice(0, atIndex)}+${companySuffix}${email.slice(atIndex)}`;
}

function createCommonEmployee(
  source: CommonEmployeeSource,
  index: number,
): DbEmployee {
  const employee = getPortalOwnerEmployee(source.sourceEmployeeId);

  return {
    ...employee,
    e_id: index + 1,
    e_name: {
      en: { ...employee.e_name.en },
    },
    e_department_id: source.departmentId,
    e_job_field_id: source.jobFieldId,
    e_company_id: 1,
    e_start_date: createUtcDate(source.startDate),
    e_end_date: null,
  };
}

function cloneEmployeeForCompany(
  company: DbCompany,
  companyIndex: number,
  employee: DbEmployee,
): DbEmployee {
  return {
    ...employee,
    e_id: createDemoEmployeeId(companyIndex, employee.e_id),
    e_username: createCompanyScopedUsername(company, employee),
    e_name: {
      en: { ...employee.e_name.en },
    },
    e_email: createCompanyScopedEmail(company, employee.e_email),
    e_department_id: createDemoDepartmentId(
      companyIndex,
      employee.e_department_id,
    ),
    e_job_field_id: createDemoJobFieldId(
      companyIndex,
      employee.e_job_field_id,
    ),
    e_company_id: company.company_id,
    e_start_date: new Date(employee.e_start_date.getTime()),
    e_end_date:
      employee.e_end_date === null
        ? null
        : new Date(employee.e_end_date.getTime()),
    e_active: company.company_active && employee.e_active,
  };
}

function createDemoCompanyEmployees(
  companies: readonly DbCompany[],
): DbEmployee[] {
  return companies
    .filter((company) => !company.company_portal_owner)
    .flatMap((company, companyIndex) =>
      commonEmployeeMockData.map((employee) =>
        cloneEmployeeForCompany(company, companyIndex, employee),
      ),
    );
}

/**
 * Compact owner-company employee set used as the template for demo data.
 *
 * The department and job field ids match demoDepartment.ts and demoJobField.ts.
 */
const commonEmployeeSources: readonly CommonEmployeeSource[] = [
  {
    sourceEmployeeId: 1,
    departmentId: 1,
    jobFieldId: 1,
    startDate: "2024-01-02",
  },
  {
    sourceEmployeeId: 2,
    departmentId: 2,
    jobFieldId: 2,
    startDate: "2024-01-09",
  },
  {
    sourceEmployeeId: 3,
    departmentId: 2,
    jobFieldId: 3,
    startDate: "2024-01-16",
  },
  {
    sourceEmployeeId: 6,
    departmentId: 3,
    jobFieldId: 4,
    startDate: "2024-01-23",
  },
  {
    sourceEmployeeId: 8,
    departmentId: 3,
    jobFieldId: 5,
    startDate: "2024-01-30",
  },
  {
    sourceEmployeeId: 30,
    departmentId: 4,
    jobFieldId: 6,
    startDate: "2024-02-06",
  },
  {
    sourceEmployeeId: 11,
    departmentId: 4,
    jobFieldId: 7,
    startDate: "2024-02-13",
  },
  {
    sourceEmployeeId: 12,
    departmentId: 4,
    jobFieldId: 8,
    startDate: "2024-02-20",
  },
  {
    sourceEmployeeId: 14,
    departmentId: 4,
    jobFieldId: 8,
    startDate: "2024-02-27",
  },
  {
    sourceEmployeeId: 26,
    departmentId: 4,
    jobFieldId: 8,
    startDate: "2024-03-05",
  },
  {
    sourceEmployeeId: 15,
    departmentId: 5,
    jobFieldId: 9,
    startDate: "2024-03-12",
  },
  {
    sourceEmployeeId: 16,
    departmentId: 5,
    jobFieldId: 10,
    startDate: "2024-03-19",
  },
  {
    sourceEmployeeId: 17,
    departmentId: 5,
    jobFieldId: 10,
    startDate: "2024-03-26",
  },
  {
    sourceEmployeeId: 31,
    departmentId: 7,
    jobFieldId: 11,
    startDate: "2024-04-02",
  },
  {
    sourceEmployeeId: 32,
    departmentId: 7,
    jobFieldId: 12,
    startDate: "2024-04-09",
  },
  {
    sourceEmployeeId: 36,
    departmentId: 8,
    jobFieldId: 13,
    startDate: "2024-04-16",
  },
  {
    sourceEmployeeId: 39,
    departmentId: 8,
    jobFieldId: 14,
    startDate: "2024-04-23",
  },
  {
    sourceEmployeeId: 41,
    departmentId: 8,
    jobFieldId: 15,
    startDate: "2024-04-30",
  },
  {
    sourceEmployeeId: 49,
    departmentId: 9,
    jobFieldId: 16,
    startDate: "2024-05-07",
  },
  {
    sourceEmployeeId: 50,
    departmentId: 9,
    jobFieldId: 17,
    startDate: "2024-05-14",
  },
];

export const commonEmployeeMockData: readonly DbEmployee[] =
  commonEmployeeSources.map(createCommonEmployee);

export const clientEmployeeMock: DbEmployee[] =
  createDemoCompanyEmployees(clientCompaniesMock);
