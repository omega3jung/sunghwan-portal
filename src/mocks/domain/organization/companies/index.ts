import type { DbCompany } from "@/feature/organization/company/types";

import demoCompanyMock from "./demoCompany.json";

export const allCompaniesMock: DbCompany[] = demoCompanyMock;

export const clientCompaniesMock: DbCompany[] = demoCompanyMock.filter(
  (company) => !company.company_portal_owner,
);

const portalOwnerCompaniesMock = demoCompanyMock.filter(
  (company) => company.company_portal_owner,
);

if (portalOwnerCompaniesMock.length !== 1) {
  throw new Error(
    `[company mock] Expected exactly one portal owner company, but found ${portalOwnerCompaniesMock.length}.`,
  );
}

export const internalCompanyMock: DbCompany = portalOwnerCompaniesMock[0];
