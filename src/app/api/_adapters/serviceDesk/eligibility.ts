import * as localEligibility from "@/app/api/_adapters/localDemo/serviceDesk/eligibility";
import type { DataScope } from "@/domain/auth";
import type { ApprovalAssigneeType, AssigneeGroup } from "@/domain/serviceDesk";
import * as remoteEmployees from "@/server/data/organization/employees";
import * as remoteCategory from "@/server/data/serviceDesk/category";

export type ServiceDeskCategoryContext =
  remoteCategory.ServiceDeskCategoryContext;

export async function getServiceDeskCategoryContext(
  dataScope: DataScope,
  categoryId: string | number,
) {
  return dataScope === "LOCAL"
    ? localEligibility.getServiceDeskCategoryContext("LOCAL", categoryId)
    : remoteCategory.getServiceDeskCategoryContext(dataScope, categoryId);
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
    : remoteEmployees.assertApprovalAssigneeEligible({
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
    : remoteEmployees.assertAssignmentAssigneeEligible({
        dataScope,
        category,
        assignee,
      });
}
