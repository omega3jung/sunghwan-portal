import { DbCategoryApprovalSettings } from "@/feature/serviceDesk/approvalStep";
import { DbAssignmentRule } from "@/feature/serviceDesk/assignmentRule";
import { DbTenantCategoryTree } from "@/feature/serviceDesk/category";
import {
  clientApprovalStepSettingsMock,
  clientAssignmentRuleSettingsMock,
  clientCategorySettingsMock,
  internalApprovalStepSettingsMock,
  internalAssignmentRuleSettingsMock,
  internalCategorySettingsMock,
} from "@/mocks";

const clone = <T>(value: T): T => structuredClone(value);

type LocalDemoSettingsState = {
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

export function getLocalDemoCategories(isInternal: boolean) {
  const state = getLocalDemoSettingsState();
  return isInternal ? state.internalCategories : state.clientCategories;
}

export function getLocalDemoApprovalStepsTree(isInternal: boolean) {
  const state = getLocalDemoSettingsState();
  return isInternal
    ? {
        categoryTrees: state.internalCategories,
        templateCategories: [
          ...state.internalApprovalSteps,
          ...state.clientApprovalSteps,
        ],
      }
    : {
        categoryTrees: state.clientCategories,
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
        categoryTrees: state.internalCategories,
        templateRules: [
          ...state.internalAssignmentRules,
          ...state.clientAssignmentRules,
        ],
      }
    : {
        categoryTrees: state.clientCategories,
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
