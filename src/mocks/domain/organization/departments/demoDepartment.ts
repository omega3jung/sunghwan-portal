import type { DbCompany } from "@/feature/organization/company";
import type { DbDepartment } from "@/feature/organization/department";

import { clientCompaniesMock } from "../companies";

const createDemoDepartmentId = (companyIndex: number, departmentId: number) =>
  100 + companyIndex * 10 + departmentId;

const createDemoDepartmentCode = (
  company: DbCompany,
  department: DbDepartment,
) => {
  const companyCode = company.company_code ?? `C${company.company_id}`;

  return department.d_code
    ? `${companyCode}-${department.d_code}`
    : companyCode;
};

function cloneDepartmentForCompany(
  company: DbCompany,
  companyIndex: number,
  department: DbDepartment,
): DbDepartment {
  return {
    ...department,
    d_id: createDemoDepartmentId(companyIndex, department.d_id),
    d_name: { ...department.d_name },
    d_code: createDemoDepartmentCode(company, department),
    d_description: department.d_description
      ? { ...department.d_description }
      : null,
    d_company_id: company.company_id,
    d_parent_id:
      department.d_parent_id === null
        ? null
        : createDemoDepartmentId(companyIndex, department.d_parent_id),
    d_active: company.company_active && department.d_active,
  };
}

function createDemoCompanyDepartments(
  companies: readonly DbCompany[],
): DbDepartment[] {
  return companies
    .filter((company) => !company.company_portal_owner)
    .flatMap((company, companyIndex) =>
      commonDepartmentMockData.map((department) =>
        cloneDepartmentForCompany(company, companyIndex, department),
      ),
    );
}

/**
 * Compact owner-company department tree used as the template for demo data.
 *
 * Corporate
 * - Human Resources
 * - Finance
 * - Sales
 * - Customer Support
 *
 * IT
 * - Application Development
 * - IT Support
 */
const commonDepartmentMockData: readonly DbDepartment[] = [
  {
    d_id: 1,
    d_name: {
      en: "Corporate",
    },
    d_code: "CO",
    d_description: {
      en: "Main corporate department",
    },
    d_company_id: 1,
    d_parent_id: null,
    d_active: true,
  },
  {
    d_id: 2,
    d_name: {
      en: "Human Resources",
    },
    d_code: "HRE",
    d_description: null,
    d_company_id: 1,
    d_parent_id: 1,
    d_active: true,
  },
  {
    d_id: 3,
    d_name: {
      en: "Finance",
    },
    d_code: "FIN",
    d_description: null,
    d_company_id: 1,
    d_parent_id: 1,
    d_active: true,
  },
  {
    d_id: 4,
    d_name: {
      en: "Sales",
    },
    d_code: "SAL",
    d_description: null,
    d_company_id: 1,
    d_parent_id: 1,
    d_active: true,
  },
  {
    d_id: 5,
    d_name: {
      en: "Customer Support",
    },
    d_code: "CUS",
    d_description: null,
    d_company_id: 1,
    d_parent_id: 1,
    d_active: true,
  },
  {
    d_id: 7,
    d_name: {
      en: "IT",
    },
    d_code: "IT",
    d_description: {
      en: "Information technology department",
    },
    d_company_id: 1,
    d_parent_id: null,
    d_active: true,
  },
  {
    d_id: 8,
    d_name: {
      en: "Application Development",
    },
    d_code: "APP",
    d_description: null,
    d_company_id: 1,
    d_parent_id: 7,
    d_active: true,
  },
  {
    d_id: 9,
    d_name: {
      en: "IT Support",
    },
    d_code: "ISP",
    d_description: {
      en: "Management of PCs, peripherals, and network equipment",
    },
    d_company_id: 1,
    d_parent_id: 7,
    d_active: true,
  },
];

export const clientDepartmentsMock: DbDepartment[] =
  createDemoCompanyDepartments(clientCompaniesMock);
