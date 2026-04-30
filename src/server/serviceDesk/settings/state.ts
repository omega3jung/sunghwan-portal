import { DbCategoryApprovalSettings } from "@/feature/serviceDesk/approvalStep";
import { DbAssignmentRule } from "@/feature/serviceDesk/assignmentRule";
import { DbClientCategoryTree } from "@/feature/serviceDesk/category";
import {
  clientApprovalStepSettingsMock,
  clientAssignmentRuleSettingsMock,
  clientCategorySettingsMock,
  internalApprovalStepSettingsMock,
  internalAssignmentRuleSettingsMock,
  internalCategorySettingsMock,
} from "@/mocks";

const clone = <T>(value: T): T => structuredClone(value);

let localDemoInternalCategories = clone<DbClientCategoryTree[]>(
  internalCategorySettingsMock,
);
let localDemoInternalApprovalSteps = clone<DbCategoryApprovalSettings[]>(
  internalApprovalStepSettingsMock,
);
let localDemoInternalAssignmentRules = clone<DbAssignmentRule[]>(
  internalAssignmentRuleSettingsMock,
);

let localDemoClientCategories = clone<DbClientCategoryTree[]>(
  clientCategorySettingsMock,
);
let localDemoClientApprovalSteps = clone<DbCategoryApprovalSettings[]>(
  clientApprovalStepSettingsMock,
);
let localDemoClientAssignmentRules = clone<DbAssignmentRule[]>(
  clientAssignmentRuleSettingsMock,
);

export function getLocalDemoCategories(isInternal: boolean) {
  return isInternal ? localDemoInternalCategories : localDemoClientCategories;
}

export function getLocalDemoApprovalStepsTree(isInternal: boolean) {
  return isInternal
    ? {
        categoryTrees: localDemoInternalCategories,
        templateCategories: [
          ...localDemoInternalApprovalSteps,
          ...localDemoClientApprovalSteps,
        ],
      }
    : {
        categoryTrees: localDemoClientCategories,
        templateCategories: localDemoClientApprovalSteps,
      };
}
export function getLocalDemoApprovalSteps(isInternal: boolean) {
  return isInternal
    ? localDemoInternalApprovalSteps
    : localDemoClientApprovalSteps;
}

export function getLocalDemoAssignmentRulesTree(isInternal: boolean) {
  return isInternal
    ? {
        categoryTrees: localDemoInternalCategories,
        templateRules: [
          ...localDemoInternalAssignmentRules,
          ...localDemoClientAssignmentRules,
        ],
      }
    : {
        categoryTrees: localDemoClientCategories,
        templateRules: localDemoClientAssignmentRules,
      };
}
export function getLocalDemoAssignmentRules(isInternal: boolean) {
  return isInternal
    ? localDemoInternalAssignmentRules
    : localDemoClientAssignmentRules;
}

export function resetLocalDemoSettingsState() {
  localDemoInternalCategories = clone<DbClientCategoryTree[]>(
    internalCategorySettingsMock,
  );
  localDemoInternalApprovalSteps = clone<DbCategoryApprovalSettings[]>(
    internalApprovalStepSettingsMock,
  );
  localDemoInternalAssignmentRules = clone<DbAssignmentRule[]>(
    internalAssignmentRuleSettingsMock,
  );

  localDemoClientCategories = clone<DbClientCategoryTree[]>(
    clientCategorySettingsMock,
  );
  localDemoClientApprovalSteps = clone<DbCategoryApprovalSettings[]>(
    clientApprovalStepSettingsMock,
  );
  localDemoClientAssignmentRules = clone<DbAssignmentRule[]>(
    clientAssignmentRuleSettingsMock,
  );
}
