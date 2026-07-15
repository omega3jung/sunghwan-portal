import { CompanyDto } from "./companyDto";
import { mapCompanyRowsToDtos } from "./companyMapper";
import { findActiveCompanyRows } from "./companyRepository";

export async function getActiveCompanies(): Promise<CompanyDto[]> {
  const rows = await findActiveCompanyRows();

  return mapCompanyRowsToDtos(rows);
}

export async function getPortalOwnerCompany(): Promise<CompanyDto> {
  const ownerCompanies = (await getActiveCompanies()).filter(
    (company) => company.company_portal_owner,
  );

  if (ownerCompanies.length !== 1) {
    throw new Error(
      `Expected exactly one active portal owner company, but found ${ownerCompanies.length}.`,
    );
  }

  return ownerCompanies[0];
}
