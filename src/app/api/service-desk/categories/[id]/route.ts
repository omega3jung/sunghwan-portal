import { NextRequest, NextResponse } from "next/server";

import {
  getAuthToken,
  isInternalUser,
  isRemoteRequest,
  proxyJson,
  toApiErrorResponse,
} from "@/app/api/_helpers";
import { IdRouteContext } from "@/app/api/_helpers/types";
import { tServiceDeskApi } from "@/app/api/service-desk/_shared/messages";
import { mapCategoryItemPayload } from "@/feature/serviceDesk/category/mapper";
import { updateCategorySchema } from "@/feature/serviceDesk/category/request.schema";
import {
  toCategoryWritePayload,
  UpdateCategoryInput,
} from "@/feature/serviceDesk/category/write";
import {
  localGetCategory,
  localSoftDeleteCategory,
  localUpdateCategory,
} from "@/server/serviceDesk/settings/category/localDemo";

export async function GET(request: NextRequest, context: IdRouteContext) {
  const { id } = context.params;
  const token = await getAuthToken(request);
  const isRemote = token?.dataScope === "REMOTE";
  const isInternal = token?.userScope === "INTERNAL";

  if (!isRemote) {
    try {
      const category = localGetCategory({
        isInternal,
        id,
      });

      if (!category) {
        return NextResponse.json(
          { message: tServiceDeskApi("api.common.notFound") },
          { status: 404 },
        );
      }

      return NextResponse.json(category);
    } catch (error) {
      return toApiErrorResponse(error, {
        fallbackMessage: tServiceDeskApi("api.categories.fetch"),
      });
    }
  }

  const proxyQuery = new URLSearchParams(request.nextUrl.searchParams);

  if (!proxyQuery.has("isInternal")) {
    proxyQuery.set("isInternal", String(isInternal));
  }

  const defaultTenantId = resolveDefaultTenantId(token);

  if (!proxyQuery.has("tenantId") && !isInternal && defaultTenantId) {
    proxyQuery.set("tenantId", defaultTenantId);
  }

  return proxyJson(request, {
    path: `/service-desk/categories/${id}`,
    query: proxyQuery,
    errorMessage: tServiceDeskApi("api.categories.fetch"),
    mapData: mapCategoryItemPayload,
  });
}

export async function PUT(request: NextRequest, context: IdRouteContext) {
  const { id } = context.params;
  const isRemote = await isRemoteRequest(request);
  const parsedBody = updateCategorySchema.safeParse(
    (await request.json()) as UpdateCategoryInput,
  );

  if (!parsedBody.success) {
    return NextResponse.json(
      { message: tServiceDeskApi("api.categories.localDemo.invalidPayload") },
      { status: 400 },
    );
  }

  const body = parsedBody.data;

  if (!isRemote) {
    try {
      const isInternal = await isInternalUser(request);
      return NextResponse.json(
        localUpdateCategory({
          isInternal,
          id,
          input: {
            ...body,
            id,
          },
        }),
        { status: 200 },
      );
    } catch (error) {
      return toApiErrorResponse(error, {
        fallbackMessage: tServiceDeskApi("api.categories.update"),
      });
    }
  }

  return proxyJson(request, {
    method: "PUT",
    path: `/service-desk/categories/${id}`,
    body: toCategoryWritePayload({ ...body, id }),
    errorMessage: tServiceDeskApi("api.categories.update"),
    mapData: mapCategoryItemPayload,
  });
}

export async function DELETE(request: NextRequest, context: IdRouteContext) {
  const { id } = context.params;
  const isRemote = await isRemoteRequest(request);

  if (!isRemote) {
    try {
      const isInternal = await isInternalUser(request);
      return NextResponse.json(
        localSoftDeleteCategory({
          isInternal,
          id,
        }),
      );
    } catch (error) {
      return toApiErrorResponse(error, {
        fallbackMessage: tServiceDeskApi("api.categories.delete"),
      });
    }
  }

  return proxyJson(request, {
    method: "DELETE",
    path: `/service-desk/categories/${id}`,
    errorMessage: tServiceDeskApi("api.categories.delete"),
  });
}

function resolveDefaultTenantId(token: Awaited<ReturnType<typeof getAuthToken>>) {
  if (typeof token?.companyId === "number") {
    return String(token.companyId);
  }

  return null;
}
