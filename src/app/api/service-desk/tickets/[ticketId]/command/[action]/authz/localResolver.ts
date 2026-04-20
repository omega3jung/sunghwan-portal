import { camelEmployeeMapper } from "@/api/organization/employee";
import { createEmployeesMock } from "@/app/_mocks/domain/organization/employee";
import { DEMO_USER_IDS, resolveDemoProfile } from "@/app/_mocks/domain/user";

import type {
  TicketActionAuthorizationContext,
  TicketActionAuthorizationIdentity,
} from "./types";

// Demo auth users and organization employees are separate mock datasets,
// so local-only authz needs an explicit bridge until real identity/org joins exist.
const LOCAL_DEMO_EMPLOYEE_ID_BY_USER_ID: Partial<Record<string, string>> = {
  [DEMO_USER_IDS.INTERNAL.ADMIN]: "31",
  [DEMO_USER_IDS.INTERNAL.MANAGER]: "31",
  [DEMO_USER_IDS.INTERNAL.USER]: "33",
  [DEMO_USER_IDS.INTERNAL.GUEST]: "32",
};

const localEmployees = camelEmployeeMapper(createEmployeesMock());

function resolveLocalEmployee(identity: TicketActionAuthorizationIdentity) {
  const normalizedEmail = identity.email?.toLowerCase() ?? null;

  const matchedById = localEmployees.find(
    (employee) => employee.id === identity.userId,
  );

  if (matchedById) {
    return matchedById;
  }

  if (normalizedEmail) {
    const matchedByEmail = localEmployees.find(
      (employee) => employee.email.toLowerCase() === normalizedEmail,
    );

    if (matchedByEmail) {
      return matchedByEmail;
    }
  }

  const demoProfile = resolveDemoProfile(identity.userId);
  const demoProfileEmail = demoProfile?.email?.toLowerCase() ?? null;

  if (demoProfileEmail) {
    const matchedByDemoEmail = localEmployees.find(
      (employee) => employee.email.toLowerCase() === demoProfileEmail,
    );

    if (matchedByDemoEmail) {
      return matchedByDemoEmail;
    }
  }

  const bridgedEmployeeId = LOCAL_DEMO_EMPLOYEE_ID_BY_USER_ID[identity.userId];

  if (!bridgedEmployeeId) {
    return null;
  }

  return (
    localEmployees.find((employee) => employee.id === bridgedEmployeeId) ?? null
  );
}

export async function resolveLocalActionAuthorizationContext(
  identity: TicketActionAuthorizationIdentity,
): Promise<TicketActionAuthorizationContext> {
  const demoProfile = resolveDemoProfile(identity.userId);
  const employee = resolveLocalEmployee(identity);

  return {
    userId: identity.userId,
    role: demoProfile?.role ?? identity.role,
    companyId:
      demoProfile?.companyId ?? identity.companyId ?? employee?.companyId ?? null,
    departmentId: employee?.departmentId ?? null,
  };
}
