import {
  DbCategory,
  DbTenantCategoryTree,
} from "@/feature/serviceDesk/category/";

import { clientTenantsMock, internalTenantMock } from "../tenants";
import {
  client1PortalSystemIssueMock,
  client2PortalSystemIssueMock,
  clientAccountAccessMock,
  clientHardwareDeviceMock,
  clientHrSystemPayrollMock,
  clientNetworkConnectivityMock,
  clientPrintingOfficeEquipmentMock,
  clientSoftwareApplicationMock,
} from "./client";
import {
  internalAccountAccessMock,
  internalClientUserSupportMock,
  internalDataInfoManagementMock,
  internalHardwareDeviceMock,
  internalHrSystemPayrollMock,
  internalNetworkConnectivityMock,
  internalOtherInquiryMock,
  internalPortalSystemIssueMock,
  internalPrintingOfficeEquipmentMock,
  internalSoftwareApplicationMock,
} from "./internal";

export const internalCategoryMock: DbCategory[] = [
  internalPortalSystemIssueMock,
  internalAccountAccessMock,
  internalHardwareDeviceMock,
  internalSoftwareApplicationMock,
  internalNetworkConnectivityMock,
  internalPrintingOfficeEquipmentMock,
  internalHrSystemPayrollMock,
  internalDataInfoManagementMock,
  internalClientUserSupportMock,
  internalOtherInquiryMock,
];

export const internalCategorySettingsMock: DbTenantCategoryTree[] = [
  {
    ...internalTenantMock,
    category: internalCategoryMock,
  },
  {
    ...clientTenantsMock[0],
    category: [client1PortalSystemIssueMock],
  },
  {
    ...clientTenantsMock[1],
    category: [client2PortalSystemIssueMock],
  },
];

export const clientCategorySettingsMock: DbTenantCategoryTree[] = [
  {
    ...clientTenantsMock[0],
    category: [
      client1PortalSystemIssueMock,
      clientAccountAccessMock,
      clientHardwareDeviceMock,
      clientSoftwareApplicationMock,
      clientNetworkConnectivityMock,
      clientPrintingOfficeEquipmentMock,
      clientHrSystemPayrollMock,
    ],
  },
];
