import { NextRequest, NextResponse } from "next/server";

import {
  getApprovalSettingsResponseByTenantId,
  getApprovalStepById,
  getApprovalStepsByTenantId,
  getCategoryApprovalSettingsByTenantId,
} from "@/server/data/serviceDesk/approvalStep";
import {
  getAssignmentRuleByCategoryId,
  getAssignmentRulesByTenantId,
  getAssignmentRulesResponseByTenantId,
} from "@/server/data/serviceDesk/assignmentRule";
import {
  getCategoryById,
  getCategorySettingsResponseByTenantId,
  getCategoryTreeByTenantId,
} from "@/server/data/serviceDesk/category";
import { getActiveTenantById, getActiveTenants } from "@/server/data/serviceDesk/tenant";
import { isBoolean } from "@/shared/utils/value";

import { PortalApiJsonOptions } from "../types";
import { getPortalApiQueryValue, normalizePath } from "../utils";

const CATEGORY_LIST_PATH_PATTERN = /^\/service-desk\/categories$/;
const TENANT_LIST_PATH_PATTERN = /^\/service-desk\/tenants$/;
const TENANT_DETAIL_PATH_PATTERN = /^\/service-desk\/tenants\/([^/]+)$/;
const CATEGORY_TREE_PATH_PATTERN =
  /^\/service-desk\/categories\/tenant\/([^/]+)$/;
const CATEGORY_DETAIL_PATH_PATTERN = /^\/service-desk\/categories\/([^/]+)$/;
const ASSIGNMENT_RULES_LIST_PATH_PATTERN = /^\/service-desk\/assignment-rules$/;
const ASSIGNMENT_RULES_PATH_PATTERN =
  /^\/service-desk\/assignment-rules\/tenant\/([^/]+)$/;
const ASSIGNMENT_RULE_DETAIL_PATH_PATTERN =
  /^\/service-desk\/assignment-rules\/([^/]+)$/;
const APPROVAL_SETTINGS_LIST_PATH_PATTERN = /^\/service-desk\/approval-steps$/;
const APPROVAL_SETTINGS_PATH_PATTERN =
  /^\/service-desk\/approval-steps\/tenant\/([^/]+)$/;
const APPROVAL_STEPS_PATH_PATTERN =
  /^\/service-desk\/approval-steps\/tenant\/([^/]+)\/steps$/;
const APPROVAL_STEP_DETAIL_PATH_PATTERN =
  /^\/service-desk\/approval-steps\/([^/]+)$/;

export async function handleServiceDeskPortalApi(
  request: NextRequest,
  options: PortalApiJsonOptions,
) {
  const path = normalizePath(options.path);
  const categoryListMatch = CATEGORY_LIST_PATH_PATTERN.exec(path);
  const tenantListMatch = TENANT_LIST_PATH_PATTERN.exec(path);
  const tenantDetailMatch = TENANT_DETAIL_PATH_PATTERN.exec(path);
  const categoryTreeMatch = CATEGORY_TREE_PATH_PATTERN.exec(path);
  const categoryDetailMatch = CATEGORY_DETAIL_PATH_PATTERN.exec(path);
  const assignmentRulesListMatch =
    ASSIGNMENT_RULES_LIST_PATH_PATTERN.exec(path);
  const assignmentRulesMatch = ASSIGNMENT_RULES_PATH_PATTERN.exec(path);
  const assignmentRuleDetailMatch =
    ASSIGNMENT_RULE_DETAIL_PATH_PATTERN.exec(path);
  const approvalSettingsListMatch =
    APPROVAL_SETTINGS_LIST_PATH_PATTERN.exec(path);
  const approvalSettingsMatch = APPROVAL_SETTINGS_PATH_PATTERN.exec(path);
  const approvalStepsMatch = APPROVAL_STEPS_PATH_PATTERN.exec(path);
  const approvalStepDetailMatch = APPROVAL_STEP_DETAIL_PATH_PATTERN.exec(path);
  const method = options.method ?? "GET";

  try {
    if (method !== "GET") {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    if (tenantListMatch) {
      const items = await getActiveTenants();

      return NextResponse.json({
        items,
        total: items.length,
      });
    }

    if (tenantDetailMatch) {
      const tenantId = decodeURIComponent(tenantDetailMatch[1] ?? "");
      const tenant = await getActiveTenantById(tenantId);

      if (!tenant) {
        return NextResponse.json({ message: "Not found" }, { status: 404 });
      }

      return NextResponse.json(tenant);
    }

    if (categoryListMatch) {
      const tenantId = getPortalApiQueryValue(request, options, "tenantId");
      const isInternal =
        parseBooleanQueryValue(
          getPortalApiQueryValue(request, options, "isInternal"),
        ) ?? true;
      const items = await getCategorySettingsResponseByTenantId({
        tenantId,
        isInternal,
      });

      return NextResponse.json({
        items,
        total: items.length,
      });
    }

    if (assignmentRulesListMatch) {
      const tenantId = getPortalApiQueryValue(request, options, "tenantId");
      const isInternal =
        parseBooleanQueryValue(
          getPortalApiQueryValue(request, options, "isInternal"),
        ) ?? true;
      const items = await getAssignmentRulesResponseByTenantId({
        tenantId,
        isInternal,
      });

      return NextResponse.json({
        items,
        total: items.length,
      });
    }

    if (categoryTreeMatch) {
      const tenantId = decodeURIComponent(categoryTreeMatch[1] ?? "");
      const categories = await getCategoryTreeByTenantId(tenantId);

      return NextResponse.json({ data: categories });
    }

    if (categoryDetailMatch) {
      const categoryId = decodeURIComponent(categoryDetailMatch[1] ?? "");
      const tenantId = getPortalApiQueryValue(request, options, "tenantId");
      const isInternal =
        parseBooleanQueryValue(
          getPortalApiQueryValue(request, options, "isInternal"),
        ) ?? true;
      const category = await getCategoryById({
        categoryId,
        tenantId,
        isInternal,
      });

      if (!category) {
        return NextResponse.json({ message: "Not found" }, { status: 404 });
      }

      return NextResponse.json(category);
    }

    if (approvalSettingsListMatch) {
      const tenantId = getPortalApiQueryValue(request, options, "tenantId");
      const isInternal =
        parseBooleanQueryValue(
          getPortalApiQueryValue(request, options, "isInternal"),
        ) ?? true;
      const items = await getApprovalSettingsResponseByTenantId({
        tenantId,
        isInternal,
      });

      return NextResponse.json({
        items,
        total: items.length,
      });
    }

    if (assignmentRulesMatch) {
      const tenantId = decodeURIComponent(assignmentRulesMatch[1] ?? "");
      const assignmentRules = await getAssignmentRulesByTenantId(tenantId);

      return NextResponse.json({ data: assignmentRules });
    }

    if (assignmentRuleDetailMatch) {
      const categoryId = decodeURIComponent(assignmentRuleDetailMatch[1] ?? "");
      const tenantId = getPortalApiQueryValue(request, options, "tenantId");
      const isInternal =
        parseBooleanQueryValue(
          getPortalApiQueryValue(request, options, "isInternal"),
        ) ?? true;
      const assignmentRule = await getAssignmentRuleByCategoryId({
        categoryId,
        tenantId,
        isInternal,
      });

      if (!assignmentRule) {
        return NextResponse.json({ message: "Not found" }, { status: 404 });
      }

      return NextResponse.json(assignmentRule);
    }

    if (approvalStepsMatch) {
      const tenantId = decodeURIComponent(approvalStepsMatch[1] ?? "");
      const approvalSteps = await getApprovalStepsByTenantId(tenantId);

      return NextResponse.json({ data: approvalSteps });
    }

    if (approvalSettingsMatch) {
      const tenantId = decodeURIComponent(approvalSettingsMatch[1] ?? "");
      const approvalSettings =
        await getCategoryApprovalSettingsByTenantId(tenantId);

      return NextResponse.json({ data: approvalSettings });
    }

    if (approvalStepDetailMatch) {
      const approvalStepId = decodeURIComponent(
        approvalStepDetailMatch[1] ?? "",
      );
      const tenantId = getPortalApiQueryValue(request, options, "tenantId");
      const isInternal =
        parseBooleanQueryValue(
          getPortalApiQueryValue(request, options, "isInternal"),
        ) ?? true;
      const approvalStep = await getApprovalStepById({
        approvalStepId,
        tenantId,
        isInternal,
      });

      if (!approvalStep) {
        return NextResponse.json({ message: "Not found" }, { status: 404 });
      }

      return NextResponse.json(approvalStep);
    }

    return NextResponse.json({ message: "Not found" }, { status: 404 });
  } catch {
    return NextResponse.json(
      { message: options.errorMessage },
      { status: 500 },
    );
  }
}

function parseBooleanQueryValue(value: string | null): boolean | null {
  if (value === null || !isBoolean(value)) {
    return null;
  }

  return value === "true";
}
