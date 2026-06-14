import { Company } from "@/domain/organization";
import { idToNumber } from "@/lib/api/utils/mapId";
import { undefinedToNull } from "@/shared/utils/value";

import { DbCompany } from "./types";

type CompanyWriteFields = Pick<Company, "name" | "code" | "isPortalOwner" | "active">;

type DbCompanyWriteInput = Omit<DbCompany, "company_id" | "company_code"> & {
  company_id?: number | null;
  company_code?: string | null;
};

export type CreateCompanyInput = CompanyWriteFields & { id?: string };
export type UpdateCompanyInput = CompanyWriteFields & { id: string };

export function toCompanyWritePayload(
  input: CreateCompanyInput | UpdateCompanyInput,
): DbCompanyWriteInput {
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
  id = createMockId(),
): Company {
  return { id, ...input };
}

function createMockId() {
  return Date.now().toString();
}
