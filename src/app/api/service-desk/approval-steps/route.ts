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
  camelCategoryApprovalSettingMapper,
  mapApprovalSettingsListPayload,
  mapApprovalSettingsTreePayload,
} from "@/feature/serviceDesk/approvalStep/mapper";
import { saveApprovalStepTreeSchema } from "@/feature/serviceDesk/approvalStep/request.schema";
import type { SaveServiceDeskApprovalStepTreePayload } from "@/feature/serviceDesk/approvalStep/types";
import {
  canManageServiceDeskSettings,
  resolveSettingsAccess,
} from "@/lib/application/serviceDesk";
import { assertApprovalAssigneeEligible } from "@/server/data/organization/employees";
import {
  getCategoryApprovalSettingsByTenantId,
} from "@/server/data/serviceDesk/approvalStep";
import { getServiceDeskCategoryContext } from "@/server/data/serviceDesk/category";
import {
  localListApprovalSteps,
  localSaveApprovalStepTree,
} from "@/server/serviceDesk/settings/approvalStep/localDemo";
import {
  getApprovalStepStore,
  normalizeCategoryApprovalSettings,
} from "@/server/serviceDesk/settings/approvalStep/localDemo/approvalStepUtils";

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
          resource: "APPROVAL_STEP",
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
        localListApprovalSteps({
          isInternal: settingsAuthorization
            ? settingsAuthorization.tenant.isOwnerTenant
            : isInternal,
          searchParams: proxyQuery,
        }),
      );
    }

    return portalApiJson(request, {
      path: "/service-desk/approval-steps",
      query: proxyQuery,
      errorMessage: tServiceDeskApi("api.approvalSteps.fetchList"),
      mapData: mapApprovalSettingsListPayload,
    });
  } catch (error) {
    return toApiErrorResponse(error, {
      fallbackMessage: tServiceDeskApi("api.approvalSteps.fetchList"),
    });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const parsedBody = saveApprovalStepTreeSchema.safeParse(
      (await request.json()) as SaveServiceDeskApprovalStepTreePayload,
    );

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          message: tServiceDeskApi(
            "api.approvalSteps.localDemo.invalidPayload",
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

    const useOwnerStore = tenant.isOwnerTenant;
    const currentSettings =
      authorization.dataScope === "LOCAL"
        ? normalizeCategoryApprovalSettings(
            getApprovalStepStore(useOwnerStore)[tenant.id] ?? [],
          )
        : camelCategoryApprovalSettingMapper(
            await getCategoryApprovalSettingsByTenantId(tenant.id),
          );
    const currentStepsById = new Map(
      currentSettings.flatMap((category) =>
        category.approvalSteps.map((step) => [step.id, step] as const),
      ),
    );
    const submittedCategoryIds = new Set<string>();
    const submittedStepIds = new Set<string>();
    const submittedScopes = new Set<string>();

    for (const category of body.categories) {
      if (submittedCategoryIds.has(category.id)) {
        throw createBadRequest("A category cannot be submitted more than once.");
      }
      submittedCategoryIds.add(category.id);

      const categoryContext = await getServiceDeskCategoryContext(
        authorization.dataScope,
        category.id,
      );

      if (!categoryContext || categoryContext.tenant.id !== tenant.id) {
        throw createBadRequest(
          "Approval settings must reference a main category in the target tenant.",
        );
      }

      if (categoryContext.mainCategoryId !== category.id) {
        throw createBadRequest("Approval settings require a main category.");
      }

      const access = resolveSettingsAccess(authorization.principal, {
        resource: "APPROVAL_STEP",
        tenantCompanyId: tenant.companyId,
        isOwnerTenant: tenant.isOwnerTenant,
        scope: categoryContext.scope,
      });

      if (!canManageServiceDeskSettings(access)) {
        throw Object.assign(
          new Error("Approval settings are read-only for this category scope."),
          { status: 403 },
        );
      }
      submittedScopes.add(categoryContext.scope);

      for (const step of category.approvalSteps) {
        if (step.id) {
          const currentStep = currentStepsById.get(step.id);

          if (
            !currentStep ||
            currentStep.categoryId !== category.id ||
            submittedStepIds.has(step.id)
          ) {
            throw createBadRequest(
              "An approval step cannot move to another category or tenant.",
            );
          }

          submittedStepIds.add(step.id);
        }

        await assertApprovalAssigneeEligible({
          dataScope: authorization.dataScope,
          category: categoryContext,
          assignee: step.stepAssignee,
        });
      }
    }

    if (authorization.dataScope === "LOCAL") {
      const savedSettings = localSaveApprovalStepTree({
        isInternal: useOwnerStore,
        payload: body,
      });

      return NextResponse.json(
        savedSettings.filter((category) => submittedScopes.has(category.scope)),
      );
    }

    return portalApiJson(request, {
      method: "PUT",
      path: "/service-desk/approval-steps",
      body,
      errorMessage: tServiceDeskApi("api.approvalSteps.save"),
      mapData: (payload) => {
        const settings = mapApprovalSettingsTreePayload(payload);

        return Array.isArray(settings)
          ? settings.filter((category) => submittedScopes.has(category.scope))
          : settings;
      },
    });
  } catch (error) {
    return toApiErrorResponse(error, {
      fallbackMessage: tServiceDeskApi("api.approvalSteps.save"),
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
