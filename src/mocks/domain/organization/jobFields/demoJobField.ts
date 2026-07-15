import type { DbCompany } from "@/feature/organization/company";
import type { DbJobField } from "@/feature/organization/jobField";

import { clientCompaniesMock } from "../companies";

const createDemoDepartmentId = (companyIndex: number, departmentId: number) =>
  100 + companyIndex * 10 + departmentId;

const createDemoJobFieldId = (companyIndex: number, jobFieldId: number) =>
  1000 + companyIndex * 100 + jobFieldId;

function cloneJobFieldForCompany(
  company: DbCompany,
  companyIndex: number,
  jobField: DbJobField,
): DbJobField {
  return {
    ...jobField,
    jf_id: createDemoJobFieldId(companyIndex, jobField.jf_id),
    jf_name: { ...jobField.jf_name },
    jf_description: jobField.jf_description
      ? { ...jobField.jf_description }
      : null,
    jf_department_id: createDemoDepartmentId(
      companyIndex,
      jobField.jf_department_id,
    ),
    jf_company_id: company.company_id,
    jf_parent_id:
      jobField.jf_parent_id === null || jobField.jf_parent_id === 0
        ? null
        : createDemoJobFieldId(companyIndex, jobField.jf_parent_id),
    jf_active: company.company_active && jobField.jf_active,
  };
}

function createDemoCompanyJobFields(
  companies: readonly DbCompany[],
): DbJobField[] {
  return companies
    .filter((company) => !company.company_portal_owner)
    .flatMap((company, companyIndex) =>
      commonJobFieldMockData.map((jobField) =>
        cloneJobFieldForCompany(company, companyIndex, jobField),
      ),
    );
}

/**
 * Compact owner-company job field tree used as the template for demo data.
 *
 * Corporate
 * Human Resources
 * - HR Manager
 * Finance
 * - Financial Controller
 * Sales
 * - Account Manager
 * - Sales Representative
 * Customer Support
 * - Support Specialist
 * IT
 * - IT Manager
 * - Development Manager
 *   - Frontend Engineer
 *   - Backend Engineer
 * - IT Support Manager
 *   - IT Support Specialist
 */
export const commonJobFieldMockData: readonly DbJobField[] = [
  {
    jf_id: 1,
    jf_name: {
      en: "Head of Corporate Affairs",
    },
    jf_description: {
      en: "",
    },
    jf_department_id: 1,
    jf_company_id: 1,
    jf_parent_id: null,
    jf_active: true,
  },
  {
    jf_id: 2,
    jf_name: {
      en: "HR Director",
    },
    jf_description: {
      en: "",
    },
    jf_department_id: 2,
    jf_company_id: 1,
    jf_parent_id: null,
    jf_active: true,
  },
  {
    jf_id: 3,
    jf_name: {
      en: "HR Manager",
    },
    jf_description: {
      en: "",
    },
    jf_department_id: 2,
    jf_company_id: 1,
    jf_parent_id: 2,
    jf_active: true,
  },
  {
    jf_id: 4,
    jf_name: {
      en: "Finance Manager",
    },
    jf_description: {
      en: "",
    },
    jf_department_id: 3,
    jf_company_id: 1,
    jf_parent_id: null,
    jf_active: true,
  },
  {
    jf_id: 5,
    jf_name: {
      en: "Financial Controller",
    },
    jf_description: {
      en: "",
    },
    jf_department_id: 3,
    jf_company_id: 1,
    jf_parent_id: 4,
    jf_active: true,
  },
  {
    jf_id: 6,
    jf_name: {
      en: "Sales Manager",
    },
    jf_description: {
      en: "",
    },
    jf_department_id: 4,
    jf_company_id: 1,
    jf_parent_id: null,
    jf_active: true,
  },
  {
    jf_id: 7,
    jf_name: {
      en: "Account Manager",
    },
    jf_description: {
      en: "",
    },
    jf_department_id: 4,
    jf_company_id: 1,
    jf_parent_id: 6,
    jf_active: true,
  },
  {
    jf_id: 8,
    jf_name: {
      en: "Sales Representative",
    },
    jf_description: {
      en: "",
    },
    jf_department_id: 4,
    jf_company_id: 1,
    jf_parent_id: 7,
    jf_active: true,
  },
  {
    jf_id: 9,
    jf_name: {
      en: "Customer Support Manager",
    },
    jf_description: {
      en: "",
    },
    jf_department_id: 5,
    jf_company_id: 1,
    jf_parent_id: null,
    jf_active: true,
  },
  {
    jf_id: 10,
    jf_name: {
      en: "Support Specialist",
    },
    jf_description: {
      en: "",
    },
    jf_department_id: 5,
    jf_company_id: 1,
    jf_parent_id: 9,
    jf_active: true,
  },
  {
    jf_id: 11,
    jf_name: {
      en: "IT Director",
    },
    jf_description: {
      en: "",
    },
    jf_department_id: 7,
    jf_company_id: 1,
    jf_parent_id: null,
    jf_active: true,
  },
  {
    jf_id: 12,
    jf_name: {
      en: "IT Manager",
    },
    jf_description: {
      en: "",
    },
    jf_department_id: 7,
    jf_company_id: 1,
    jf_parent_id: 11,
    jf_active: true,
  },
  {
    jf_id: 13,
    jf_name: {
      en: "Development Manager",
    },
    jf_description: {
      en: "",
    },
    jf_department_id: 8,
    jf_company_id: 1,
    jf_parent_id: 11,
    jf_active: true,
  },
  {
    jf_id: 14,
    jf_name: {
      en: "Frontend Engineer",
    },
    jf_description: {
      en: "",
    },
    jf_department_id: 8,
    jf_company_id: 1,
    jf_parent_id: 13,
    jf_active: true,
  },
  {
    jf_id: 15,
    jf_name: {
      en: "Backend Engineer",
    },
    jf_description: {
      en: "",
    },
    jf_department_id: 8,
    jf_company_id: 1,
    jf_parent_id: 13,
    jf_active: true,
  },
  {
    jf_id: 16,
    jf_name: {
      en: "IT Support Manager",
    },
    jf_description: {
      en: "",
    },
    jf_department_id: 9,
    jf_company_id: 1,
    jf_parent_id: 11,
    jf_active: true,
  },
  {
    jf_id: 17,
    jf_name: {
      en: "IT Support Specialist",
    },
    jf_description: {
      en: "",
    },
    jf_department_id: 9,
    jf_company_id: 1,
    jf_parent_id: 16,
    jf_active: true,
  },
];

export const clientJobFieldMock: DbJobField[] =
  createDemoCompanyJobFields(clientCompaniesMock);
