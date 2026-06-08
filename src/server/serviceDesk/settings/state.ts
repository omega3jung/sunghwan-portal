import { DbCategoryApprovalSettings } from "@/feature/serviceDesk/approvalStep";
import { DbAssignmentRule } from "@/feature/serviceDesk/assignmentRule";
import { DbTenantCategoryTree } from "@/feature/serviceDesk/category";
import { DbTenant } from "@/feature/serviceDesk/tenant";
import {
  clientApprovalStepSettingsMock,
  clientAssignmentRuleSettingsMock,
  clientCategorySettingsMock,
  internalApprovalStepSettingsMock,
  internalAssignmentRuleSettingsMock,
  internalCategorySettingsMock,
} from "@/mocks";
import {
  clientTenantsMock,
  internalTenantMock,
} from "@/mocks/domain/serviceDesk/tenants";

const clone = <T>(value: T): T => structuredClone(value);

type LocalDemoSettingsState = {
  tenants: DbTenant[];
  internalCategories: DbTenantCategoryTree[];
  internalApprovalSteps: DbCategoryApprovalSettings[];
  internalAssignmentRules: DbAssignmentRule[];
  clientCategories: DbTenantCategoryTree[];
  clientApprovalSteps: DbCategoryApprovalSettings[];
  clientAssignmentRules: DbAssignmentRule[];
};

declare global {
  // eslint-disable-next-line no-var
  var __SP_LOCAL_DEMO_SETTINGS_STATE__: LocalDemoSettingsState | undefined;
}

/**
 * Initial mock data is treated as the immutable source snapshot.
 * Runtime state below may be mutated by local demo handlers.
 */
function createLocalDemoSettingsState(): LocalDemoSettingsState {
  return {
    tenants: clone<DbTenant[]>([internalTenantMock, ...clientTenantsMock]),
    internalCategories: clone<DbTenantCategoryTree[]>(
      internalCategorySettingsMock,
    ),
    internalApprovalSteps: clone<DbCategoryApprovalSettings[]>(
      internalApprovalStepSettingsMock,
    ),
    internalAssignmentRules: clone<DbAssignmentRule[]>(
      internalAssignmentRuleSettingsMock,
    ),
    clientCategories: clone<DbTenantCategoryTree[]>(clientCategorySettingsMock),
    clientApprovalSteps: clone<DbCategoryApprovalSettings[]>(
      clientApprovalStepSettingsMock,
    ),
    clientAssignmentRules: clone<DbAssignmentRule[]>(
      clientAssignmentRuleSettingsMock,
    ),
  };
}

// Local demo mutations must survive refetches and route handler module reloads.
// globalThis gives us a process-level in-memory store without adding persistence.
function getLocalDemoSettingsState() {
  if (!globalThis.__SP_LOCAL_DEMO_SETTINGS_STATE__) {
    globalThis.__SP_LOCAL_DEMO_SETTINGS_STATE__ =
      createLocalDemoSettingsState();
  }

  return globalThis.__SP_LOCAL_DEMO_SETTINGS_STATE__ as LocalDemoSettingsState;
}

export function getLocalDemoTenants() {
  return getLocalDemoSettingsState().tenants;
}

export function getMutableLocalDemoCategories(isInternal: boolean) {
  const state = getLocalDemoSettingsState();
  return isInternal ? state.internalCategories : state.clientCategories;
}

export function getLocalDemoCategories(isInternal: boolean) {
  const state = getLocalDemoSettingsState();
  const activeTenantIds = new Set(
    state.tenants
      .filter((tenant) => tenant.tenant_active !== false)
      .map((tenant) => String(tenant.tenant_id)),
  );
  const scopedCategories = isInternal
    ? state.internalCategories
    : state.clientCategories;

  return scopedCategories.filter((tenant) =>
    activeTenantIds.has(String(tenant.tenant_id)),
  );
}

export function getLocalDemoApprovalStepsTree(isInternal: boolean) {
  const state = getLocalDemoSettingsState();
  return isInternal
    ? {
        categoryTrees: getLocalDemoCategories(true),
        templateCategories: [
          ...state.internalApprovalSteps,
          ...state.clientApprovalSteps,
        ],
      }
    : {
        categoryTrees: getLocalDemoCategories(false),
        templateCategories: state.clientApprovalSteps,
      };
}
export function getLocalDemoApprovalSteps(isInternal: boolean) {
  const state = getLocalDemoSettingsState();
  return isInternal ? state.internalApprovalSteps : state.clientApprovalSteps;
}

export function getLocalDemoAssignmentRulesTree(isInternal: boolean) {
  const state = getLocalDemoSettingsState();
  return isInternal
    ? {
        categoryTrees: getLocalDemoCategories(true),
        templateRules: [
          ...state.internalAssignmentRules,
          ...state.clientAssignmentRules,
        ],
      }
    : {
        categoryTrees: getLocalDemoCategories(false),
        templateRules: state.clientAssignmentRules,
      };
}
export function getLocalDemoAssignmentRules(isInternal: boolean) {
  const state = getLocalDemoSettingsState();
  return isInternal
    ? state.internalAssignmentRules
    : state.clientAssignmentRules;
}

export function resetLocalDemoSettingsState() {
  globalThis.__SP_LOCAL_DEMO_SETTINGS_STATE__ = createLocalDemoSettingsState();
}
