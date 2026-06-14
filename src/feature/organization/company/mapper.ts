import { Company } from "@/domain/organization";
import {
  createItemPayloadMapper,
  createListPayloadMapper,
} from "@/lib/api/utils/payload";
import { ArrayMapper } from "@/shared/types";
import { nullToUndefined, undefinedToNull } from "@/shared/utils/value";

import { DbCompany } from "./types";

export const camelCompanyMapper: ArrayMapper<DbCompany, Company> = (data) => {
  return data.map((item) => ({
    id: item.company_id.toString(),
    name: item.company_name,
    code: nullToUndefined(item.company_code),
    isPortalOwner: item.company_portal_owner,
    active: item.company_active,
  }));
};

export const snakeCompanyMapper: ArrayMapper<Company, DbCompany> = (data) => {
  return data.map((item) => ({
    company_id: parseInt(item.id),
    company_name: item.name,
    company_code: undefinedToNull(item.code) ?? undefined,
    company_portal_owner: item.isPortalOwner,
    company_active: item.active,
  }));
};

export const mapCompanyListPayload = createListPayloadMapper(camelCompanyMapper);
export const mapCompanyItemPayload = createItemPayloadMapper(camelCompanyMapper);
