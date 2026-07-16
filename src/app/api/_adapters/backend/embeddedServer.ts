import type { NextRequest } from "next/server";

import {
  assertApprovalAssigneeEligible,
  assertAssignmentAssigneeEligible,
} from "@/server/data/organization/employees";
import { getCategoryApprovalSettingsByTenantId } from "@/server/data/serviceDesk/approvalStep";
import {
  assertCategoryTreeMutationAllowed,
  getCategoryTreeByTenantId,
  getServiceDeskCategoryContext,
  type ServiceDeskCategoryContext,
} from "@/server/data/serviceDesk/category";
import {
  getServiceDeskSettingsTenantContext,
  getServiceDeskSettingsTenantContextByCompanyId,
  type ServiceDeskSettingsTenantContext,
} from "@/server/data/serviceDesk/tenant";
import { getUserProfileDtoByUsername } from "@/server/data/users";
import { dispatchPortalApi } from "@/server/portalApi";
import {
  handleServiceDeskEligibleEmployeesPortalApi,
  isServiceDeskEligibleEmployeeRequest,
} from "@/server/portalApi/employees/employeesPortalApiHandler";
import {
  handleServiceDeskDepartmentReferenceRequest,
  handleServiceDeskJobFieldReferenceRequest,
  isServiceDeskOrganizationReferenceRequest,
} from "@/server/portalApi/organization/serviceDeskOrganizationReferenceHandler";

import type { BackendJsonOptions } from "./types";

/**
 * Temporary in-process bridge for the monorepo runtime.
 *
 * This is the only backend adapter that may import the extractable `src/server`
 * package directly. When the APIs move to another repository, replace these
 * calls with HTTP clients while keeping route handlers unchanged.
 */
export function requestEmbeddedPortalApi(
  request: NextRequest,
  options: BackendJsonOptions,
) {
  return dispatchPortalApi(request, options);
}

export function getEmbeddedUserProfile(username: string) {
  return getUserProfileDtoByUsername(username);
}

export {
  assertApprovalAssigneeEligible as assertEmbeddedApprovalAssigneeEligible,
  assertAssignmentAssigneeEligible as assertEmbeddedAssignmentAssigneeEligible,
  assertCategoryTreeMutationAllowed as assertEmbeddedCategoryTreeMutationAllowed,
  getCategoryApprovalSettingsByTenantId as getEmbeddedCategoryApprovalSettingsByTenantId,
  getCategoryTreeByTenantId as getEmbeddedCategoryTreeByTenantId,
  getServiceDeskCategoryContext as getEmbeddedServiceDeskCategoryContext,
  getServiceDeskSettingsTenantContext as getEmbeddedServiceDeskSettingsTenantContext,
  getServiceDeskSettingsTenantContextByCompanyId as getEmbeddedServiceDeskSettingsTenantContextByCompanyId,
  handleServiceDeskDepartmentReferenceRequest as handleEmbeddedServiceDeskDepartmentReferenceRequest,
  handleServiceDeskEligibleEmployeesPortalApi as handleEmbeddedServiceDeskEligibleEmployeesPortalApi,
  handleServiceDeskJobFieldReferenceRequest as handleEmbeddedServiceDeskJobFieldReferenceRequest,
  isServiceDeskEligibleEmployeeRequest as isEmbeddedServiceDeskEligibleEmployeeRequest,
  isServiceDeskOrganizationReferenceRequest as isEmbeddedServiceDeskOrganizationReferenceRequest,
};

export type {
  ServiceDeskCategoryContext as EmbeddedServiceDeskCategoryContext,
  ServiceDeskSettingsTenantContext as EmbeddedServiceDeskSettingsTenantContext,
};
