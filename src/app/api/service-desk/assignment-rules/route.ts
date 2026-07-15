import { NextRequest, NextResponse } from "next/server";

import {
  toApiErrorResponse,
} from "@/app/api/_helpers";
import { portalApiJson } from "@/app/api/_helpers/portalApiJson";
import {
  isServiceDeskSettingsRequest,
  parseCategoryScope,
  requireSettingsResourceAccess,
  resolveAuthorizedSettingsTenant,
  resolveOperationalServiceDeskReadTarget,
  resolveServiceDeskSettingsPrincipal,
} from "@/app/api/service-desk/_shared";
import { tServiceDeskApi } from "@/app/api/service-desk/_shared/messages";
import {
  mapAssignmentRuleListPayload,
  mapAssignmentRuleTreePayload,
} from "@/feature/serviceDesk/assignmentRule/mapper";
import { saveAssignmentRuleTreeSchema } from "@/feature/serviceDesk/assignmentRule/request.schema";
import type { SaveServiceDeskAssignmentRuleTreePayload } from "@/feature/serviceDesk/assignmentRule/types";
import {
  canManageServiceDeskSettings,
  resolveSettingsAccess,
} from "@/lib/application/serviceDesk";
import { assertAssignmentAssigneeEligible } from "@/server/data/organization/employees";
import { getServiceDeskCategoryContext } from "@/server/data/serviceDesk/category";
import {
  localListAssignmentRules,
  localSaveAssignmentRuleTree,
} from "@/server/serviceDesk/settings/assignmentRule/localDemo";

export async function GET(request: NextRequest) {
  try {
    const settingsRequest = isServiceDeskSettingsRequest(request);
    const requestedScope = parseCategoryScope(
      request.nextUrl.searchParams.get("scope"),
    );
    const requestedTenantId = request.nextUrl.searchParams.get("tenantId");
    const settingsAuthorization = settingsRequest
      ? await requireSettingsResourceAccess({
          request,
          requestedTenantId,
          resource: "ASSIGNMENT_RULE",
          scope: requireCategoryScope(requestedScope),
        })
      : null;
    const principalContext =
      settingsAuthorization ??
      (await resolveServiceDeskSettingsPrincipal(request));
    const operationalTarget = settingsAuthorization
      ? null
      : await resolveOperationalServiceDeskReadTarget({
          principalContext,
          requestedTenantId,
          requestedScope,
        });
    const isRemote = principalContext.dataScope === "REMOTE";
    const proxyQuery = new URLSearchParams(request.nextUrl.searchParams);
    const isInternal = principalContext.principal.userScope === "INTERNAL";

    proxyQuery.set("isInternal", String(isInternal));

    if (settingsAuthorization) {
      proxyQuery.set("tenantId", settingsAuthorization.tenant.id);
      proxyQuery.set("scope", requestedScope as string);
      proxyQuery.set(
        "isInternal",
        String(settingsAuthorization.tenant.isOwnerTenant),
      );
    } else if (operationalTarget) {
      proxyQuery.set("tenantId", operationalTarget.tenant.id);

      if (operationalTarget.scope) {
        proxyQuery.set("scope", operationalTarget.scope);
      } else {
        proxyQuery.delete("scope");
      }
    }

    if (!isRemote) {
      return NextResponse.json(
        localListAssignmentRules({
          isInternal: settingsAuthorization
            ? settingsAuthorization.tenant.isOwnerTenant
            : isInternal,
          searchParams: proxyQuery,
        }),
      );
    }

    return portalApiJson(request, {
      path: "/service-desk/assignment-rules",
      query: proxyQuery,
      errorMessage: tServiceDeskApi("api.assignmentRules.fetchList"),
      mapData: mapAssignmentRuleListPayload,
    });
  } catch (error) {
    return toApiErrorResponse(error, {
      fallbackMessage: tServiceDeskApi("api.assignmentRules.fetchList"),
    });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const parsedBody = saveAssignmentRuleTreeSchema.safeParse(
      (await request.json()) as SaveServiceDeskAssignmentRuleTreePayload,
    );

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          message: tServiceDeskApi(
            "api.assignmentRules.localDemo.invalidPayload",
          ),
        },
        { status: 400 },
      );
    }

    const body = parsedBody.data;
    const authorization = await resolveAuthorizedSettingsTenant({
      request,
      requestedTenantId: body.tenantId,
    });
    const tenant = authorization.tenant;

    if (!tenant) {
      return NextResponse.json(
        { message: "A target tenant is required." },
        { status: 400 },
      );
    }

    const submittedCategoryIds = new Set<string>();

    for (const category of body.categories) {
      const categoryContext = await getServiceDeskCategoryContext(
        authorization.dataScope,
        category.id,
      );

      if (
        !categoryContext ||
        categoryContext.tenant.id !== tenant.id ||
        categoryContext.mainCategoryId !== category.id ||
        submittedCategoryIds.has(category.id)
      ) {
        throw createBadRequest(
          "Assignment settings must reference each target main category once.",
        );
      }

      const access = resolveSettingsAccess(authorization.principal, {
        resource: "ASSIGNMENT_RULE",
        tenantCompanyId: tenant.companyId,
        isOwnerTenant: tenant.isOwnerTenant,
        scope: categoryContext.scope,
      });

      if (!canManageServiceDeskSettings(access)) {
        throw Object.assign(
          new Error("Assignment settings are read-only for this category scope."),
          { status: 403 },
        );
      }

      submittedCategoryIds.add(category.id);
      await assertAssignmentAssigneeEligible({
        dataScope: authorization.dataScope,
        category: categoryContext,
        assignee: category.assignee,
      });

      for (const subCategory of category.subCategories) {
        const subCategoryContext = await getServiceDeskCategoryContext(
          authorization.dataScope,
          subCategory.id,
        );

        if (
          !subCategoryContext ||
          subCategoryContext.tenant.id !== tenant.id ||
          subCategoryContext.mainCategoryId !== category.id ||
          submittedCategoryIds.has(subCategory.id)
        ) {
          throw createBadRequest(
            "An assignment rule cannot move to another category or tenant.",
          );
        }

        submittedCategoryIds.add(subCategory.id);
        await assertAssignmentAssigneeEligible({
          dataScope: authorization.dataScope,
          category: subCategoryContext,
          assignee: subCategory.assignee,
        });
      }
    }

    const useOwnerStore = tenant.isOwnerTenant;

    if (authorization.dataScope === "LOCAL") {
      const savedRules = localSaveAssignmentRuleTree({
        isInternal: useOwnerStore,
        payload: body,
      });

      return NextResponse.json(
        savedRules.filter((rule) => submittedCategoryIds.has(rule.categoryId)),
      );
    }

    return portalApiJson(request, {
      method: "PUT",
      path: "/service-desk/assignment-rules",
      body,
      errorMessage: tServiceDeskApi("api.assignmentRules.save"),
      mapData: (payload) => {
        const rules = mapAssignmentRuleTreePayload(payload);

        return Array.isArray(rules)
          ? rules.filter((rule) => submittedCategoryIds.has(rule.categoryId))
          : rules;
      },
    });
  } catch (error) {
    return toApiErrorResponse(error, {
      fallbackMessage: tServiceDeskApi("api.assignmentRules.save"),
    });
  }
}

function requireCategoryScope(
  scope: ReturnType<typeof parseCategoryScope>,
) {
  if (!scope) {
    throw Object.assign(new Error("A category scope is required."), {
      status: 400,
    });
  }

  return scope;
}

function createBadRequest(message: string) {
  return Object.assign(new Error(message), { status: 400 });
}
