import { NextRequest, NextResponse } from "next/server";

import {
  camelClientCategoryTreeMapper,
  mapCategoryItemPayload,
  mapCategoryListPayload,
} from "@/api/serviceDesk/category/mapper";
import {
  CreateCategoryInput,
  toCategoryMockResource,
  toCategoryWritePayload,
} from "@/api/serviceDesk/category/write";
import {
  internalCategorySettingsMock,
  tenantCategorySettingsMock,
} from "@/app/_mocks/domain/serviceDesk/categories";
import { isInternalUser, isRemoteRequest, proxyJson } from "@/app/api/_helpers";

export async function GET(request: NextRequest) {
  const isRemote = await isRemoteRequest(request);

  // demo mode
  if (!isRemote) {
    const isInternal = await isInternalUser(request);
    const items = camelClientCategoryTreeMapper(
      isInternal ? internalCategorySettingsMock : tenantCategorySettingsMock,
    );

    return NextResponse.json({
      items,
      total: items.length,
    });
  }

  return proxyJson(request, {
    path: "/service-desk/categories",
    query: request.nextUrl.searchParams,
    errorMessage: "Failed to fetch categories",
    mapData: mapCategoryListPayload,
  });
}

export async function POST(request: NextRequest) {
  const isRemote = await isRemoteRequest(request);
  const body = (await request.json()) as CreateCategoryInput;

  // demo mode
  if (!isRemote) {
    return NextResponse.json(toCategoryMockResource(body), { status: 201 });
  }

  return proxyJson(request, {
    method: "POST",
    path: "/service-desk/categories",
    body: toCategoryWritePayload(body),
    errorMessage: "Failed to create category",
    mapData: mapCategoryItemPayload,
  });
}
