import { NextRequest, NextResponse } from "next/server";

import { toApiErrorResponse } from "@/app/api/_helpers";
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
  camelCategoryMapper,
  mapCategoryListPayload,
  mapCategoryTreePayload,
} from "@/feature/serviceDesk/category/mapper";
import { saveCategoryTreeSchema } from "@/feature/serviceDesk/category/request.schema";
import type { SaveServiceDeskCategoryTreePayload } from "@/feature/serviceDesk/category/types";
import {
  assertCategoryTreeMutationAllowed,
  getCategoryTreeByTenantId,
} from "@/server/data/serviceDesk/category";
import {
  getLocalCategoryTrees,
  localListCategories,
  localSaveCategoryTree,
} from "@/server/serviceDesk/settings/category/localDemo";

import { portalApiJson } from "../../_helpers/portalApiJson";

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
          resource: "CATEGORY",
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
    const isInternal = principalContext.principal.userScope === "INTERNAL";
    const proxyQuery = new URLSearchParams(request.nextUrl.searchParams);

    if (settingsAuthorization) {
      proxyQuery.set("tenantId", settingsAuthorization.tenant.id);
      proxyQuery.set("scope", requestedScope as string);
      proxyQuery.set(
        "isInternal",
        String(settingsAuthorization.tenant.isOwnerTenant),
      );
    } else if (operationalTarget) {
      proxyQuery.set("tenantId", operationalTarget.tenant.id);
      proxyQuery.set("isInternal", String(isInternal));

      if (operationalTarget.scope) {
        proxyQuery.set("scope", operationalTarget.scope);
      } else {
        proxyQuery.delete("scope");
      }
    }

    if (!isRemote) {
      return NextResponse.json(
        localListCategories({
          isInternal:
            settingsAuthorization
              ? settingsAuthorization.tenant.isOwnerTenant
              : isInternal,
          searchParams: proxyQuery,
        }),
      );
    }

    return portalApiJson(request, {
      path: "/service-desk/categories",
      query: proxyQuery,
      errorMessage: tServiceDeskApi("api.categories.fetchList"),
      mapData: mapCategoryListPayload,
    });
  } catch (error) {
    return toApiErrorResponse(error, {
      fallbackMessage: tServiceDeskApi("api.categories.fetchList"),
    });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const parsedBody = saveCategoryTreeSchema.safeParse(
      (await request.json()) as SaveServiceDeskCategoryTreePayload,
    );

    if (!parsedBody.success) {
      return NextResponse.json(
        { message: tServiceDeskApi("api.categories.localDemo.invalidPayload") },
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
    const isRemote = authorization.dataScope === "REMOTE";
    const currentCategories = isRemote
      ? camelCategoryMapper(await getCategoryTreeByTenantId(tenant.id))
      : (getLocalCategoryTrees(useOwnerStore).find(
          (item) => item.id === tenant.id,
        )?.categories ?? []);

    assertCategoryTreeMutationAllowed({
      principal: authorization.principal,
      tenant,
      currentCategories,
      payload: body,
    });

    const submittedScopes = new Set(body.categories.map((category) => category.scope));

    if (!isRemote) {
      const savedTree = localSaveCategoryTree({
        isInternal: useOwnerStore,
        payload: body,
      });

      return NextResponse.json({
        ...savedTree,
        categories: savedTree.categories.filter((category) =>
          submittedScopes.has(category.scope),
        ),
      });
    }

    return portalApiJson(request, {
      method: "PUT",
      path: "/service-desk/categories",
      body,
      errorMessage: tServiceDeskApi("api.categories.save"),
      mapData: (payload) => {
        const tree = mapCategoryTreePayload(payload);

        return tree
          ? {
              ...tree,
              categories: tree.categories.filter((category) =>
                submittedScopes.has(category.scope),
              ),
            }
          : null;
      },
    });
  } catch (error) {
    return toApiErrorResponse(error, {
      fallbackMessage: tServiceDeskApi("api.categories.save"),
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
