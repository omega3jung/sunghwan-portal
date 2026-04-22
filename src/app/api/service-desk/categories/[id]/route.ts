import { NextRequest, NextResponse } from "next/server";

import {
  camelClientCategoryTreeMapper,
  mapCategoryItemPayload,
} from "@/api/serviceDesk/category/mapper";
import {
  toCategoryMockResource,
  toCategoryWritePayload,
  UpdateCategoryInput,
} from "@/api/serviceDesk/category/write";
import {
  clientCategorySettingsMock,
  internalCategorySettingsMock,
} from "@/app/_mocks/domain/serviceDesk/categories";
import { isInternalUser, isRemoteRequest, proxyJson } from "@/app/api/_helpers";
import { IdRouteContext } from "@/app/api/_helpers/types";
import { tServiceDesk } from "@/app/api/service-desk/messages";

export async function GET(request: NextRequest, context: IdRouteContext) {
  const { id } = context.params;
  const isRemote = await isRemoteRequest(request);

  if (!isRemote) {
    const isInternal = await isInternalUser(request);
    const category = camelClientCategoryTreeMapper(
      isInternal ? internalCategorySettingsMock : clientCategorySettingsMock,
    )
      .flatMap((client) => client.categories)
      .find((item) => item.id === id);

    if (!category) {
      return NextResponse.json(
        { message: tServiceDesk("api.common.notFound") },
        { status: 404 },
      );
    }

    return NextResponse.json(category);
  }

  return proxyJson(request, {
    path: `/service-desk/categories/${id}`,
    errorMessage: tServiceDesk("api.categories.fetch"),
    mapData: mapCategoryItemPayload,
  });
}

export async function PUT(request: NextRequest, context: IdRouteContext) {
  const { id } = context.params;
  const isRemote = await isRemoteRequest(request);
  const body = (await request.json()) as UpdateCategoryInput;

  if (!isRemote) {
    return NextResponse.json(toCategoryMockResource(body, id), { status: 200 });
  }

  return proxyJson(request, {
    method: "PUT",
    path: `/service-desk/categories/${id}`,
    body: toCategoryWritePayload({ ...body, id }),
    errorMessage: tServiceDesk("api.categories.update"),
    mapData: mapCategoryItemPayload,
  });
}

export async function DELETE(request: NextRequest, context: IdRouteContext) {
  const { id } = context.params;
  const isRemote = await isRemoteRequest(request);

  if (!isRemote) {
    return new NextResponse(null, { status: 204 });
  }

  return proxyJson(request, {
    method: "DELETE",
    path: `/service-desk/categories/${id}`,
    errorMessage: tServiceDesk("api.categories.delete"),
  });
}
