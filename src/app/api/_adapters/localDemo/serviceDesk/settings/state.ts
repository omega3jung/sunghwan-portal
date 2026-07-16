import { DbCategoryApprovalSettings } from "@/lib/application/contracts/serviceDesk";
import { DbAssignmentRule } from "@/lib/application/contracts/serviceDesk";
import { DbTenantCategoryTree } from "@/lib/application/contracts/serviceDesk";
import { DbTenant } from "@/lib/application/contracts/serviceDesk";
import {
  clientApprovalStepSettingsMock,
  internalApprovalStepSettingsMock,
} from "@/mocks/domain/serviceDesk/approvalSteps";
import {
  clientAssignmentRuleSettingsMock,
  internalAssignmentRuleSettingsMock,
} from "@/mocks/domain/serviceDesk/assignmentRules";
import {
  clientCategorySettingsMock,
  internalCategorySettingsMock,
} from "@/mocks/domain/serviceDesk/categories";
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

type CategoryScopedItem = {
  category_id: number;
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

function replaceCategoryScopedItems<T extends CategoryScopedItem>({
  items,
  categoryIds,
  nextItems,
}: {
  items: T[];
  categoryIds: Iterable<string | number>;
  nextItems: T[];
}) {
  const categoryIdSet = new Set(
    Array.from(categoryIds, (categoryId) => String(categoryId)),
  );

  for (let index = items.length - 1; index >= 0; index -= 1) {
    if (categoryIdSet.has(String(items[index].category_id))) {
      items.splice(index, 1);
    }
  }

  items.push(...nextItems.map((item) => clone(item)));
}

function isInternalTenant(state: LocalDemoSettingsState, tenantId: string) {
  const internalTenantId = state.internalCategories[0]?.tenant_id;

  return String(internalTenantId) === tenantId;
}

export function replaceLocalDemoApprovalStepCategories({
  tenantId,
  categoryIds,
  categories,
}: {
  tenantId: string;
  categoryIds: Iterable<string | number>;
  categories: DbCategoryApprovalSettings[];
}) {
  const state = getLocalDemoSettingsState();
  const items = isInternalTenant(state, tenantId)
    ? state.internalApprovalSteps
    : state.clientApprovalSteps;

  replaceCategoryScopedItems({
    items,
    categoryIds,
    nextItems: categories,
  });
}

export function replaceLocalDemoAssignmentRules({
  tenantId,
  categoryIds,
  assignmentRules,
}: {
  tenantId: string;
  categoryIds: Iterable<string | number>;
  assignmentRules: DbAssignmentRule[];
}) {
  const state = getLocalDemoSettingsState();
  const items = isInternalTenant(state, tenantId)
    ? state.internalAssignmentRules
    : state.clientAssignmentRules;

  replaceCategoryScopedItems({
    items,
    categoryIds,
    nextItems: assignmentRules,
  });
}

export function resetLocalDemoSettingsState() {
  globalThis.__SP_LOCAL_DEMO_SETTINGS_STATE__ = createLocalDemoSettingsState();
}
