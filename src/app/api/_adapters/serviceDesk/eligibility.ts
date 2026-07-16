import * as localEligibility from "@/app/api/_adapters/localDemo/serviceDesk/eligibility";
import {
  assertEmbeddedApprovalAssigneeEligible,
  assertEmbeddedAssignmentAssigneeEligible,
  getEmbeddedServiceDeskCategoryContext,
  type EmbeddedServiceDeskCategoryContext,
} from "@/app/api/_adapters/backend/embeddedServer";
import type { DataScope } from "@/domain/auth";
import type { ApprovalAssigneeType, AssigneeGroup } from "@/domain/serviceDesk";

export type ServiceDeskCategoryContext = EmbeddedServiceDeskCategoryContext;

export async function getServiceDeskCategoryContext(
  dataScope: DataScope,
  categoryId: string | number,
) {
  return dataScope === "LOCAL"
    ? localEligibility.getServiceDeskCategoryContext("LOCAL", categoryId)
    : getEmbeddedServiceDeskCategoryContext(dataScope, categoryId);
}

export async function assertApprovalAssigneeEligible({
  dataScope,
  category,
  assignee,
}: {
  dataScope: DataScope;
  category: ServiceDeskCategoryContext;
  assignee: ApprovalAssigneeType;
}) {
  return dataScope === "LOCAL"
    ? localEligibility.assertApprovalAssigneeEligible({
        dataScope,
        category,
        assignee,
      })
    : assertEmbeddedApprovalAssigneeEligible({
        dataScope,
        category,
        assignee,
      });
}

export async function assertAssignmentAssigneeEligible({
  dataScope,
  category,
  assignee,
}: {
  dataScope: DataScope;
  category: ServiceDeskCategoryContext;
  assignee: AssigneeGroup;
}) {
  return dataScope === "LOCAL"
    ? localEligibility.assertAssignmentAssigneeEligible({
        dataScope,
        category,
        assignee,
      })
    : assertEmbeddedAssignmentAssigneeEligible({
        dataScope,
        category,
        assignee,
      });
}
