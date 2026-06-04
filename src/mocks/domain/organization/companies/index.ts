import { DbCompany } from "@/feature/organization/company";

import demoClientMock from "./demoClient.json";
import demoInternalMock from "./demoInternal.json";

export const allCompaniesMock: DbCompany[] = [
  /*  Company  */
  demoInternalMock,
  ...demoClientMock,
];

export const clientCompaniesMock: DbCompany[] = demoClientMock;

export const internalCompanyMock: DbCompany = demoInternalMock;
