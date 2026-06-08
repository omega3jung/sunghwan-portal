import { CompanyDto } from "./companyDto";
import { mapCompanyRowsToDtos } from "./companyMapper";
import { findActiveCompanyRows } from "./companyRepository";

export async function getActiveCompanies(): Promise<CompanyDto[]> {
  const rows = await findActiveCompanyRows();

  return mapCompanyRowsToDtos(rows);
}
