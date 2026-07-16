import * as localEligibility from "@/app/api/_adapters/localDemo/serviceDesk/eligibility";
import type { DataScope } from "@/domain/auth";
import {
  getServiceDeskCategoryContext as getRemoteServiceDeskCategoryContext,
  type ServiceDeskCategoryContext as RemoteServiceDeskCategoryContext,
} from "@/server/data/serviceDesk/category";

export type ServiceDeskCategoryContext = RemoteServiceDeskCategoryContext;

export async function getServiceDeskCategoryContext(
  dataScope: DataScope,
  categoryId: string | number,
) {
  return dataScope === "LOCAL"
    ? localEligibility.getServiceDeskCategoryContext(categoryId)
    : getRemoteServiceDeskCategoryContext(categoryId);
}
