import { NextRequest, NextResponse } from "next/server";

import {
  mapCategoryItemPayload,
  mapCategoryListPayload,
  mapCategoryTreePayload,
} from "@/api/serviceDesk/category/mapper";
import {
  CreateCategoryInput,
  toCategoryWritePayload,
} from "@/api/serviceDesk/category/write";
import {
  isInternalUser,
  isRemoteRequest,
  proxyJson,
  toApiErrorResponse,
} from "@/app/api/_helpers";
import { tServiceDeskApi } from "@/app/api/service-desk/_shared/messages";
import {
  createCategorySchema,
  saveCategoryTreeSchema,
} from "@/feature/serviceDesk/category/request.schema";
import type { SaveServiceDeskCategoryTreePayload } from "@/feature/serviceDesk/category/types";

import {
  localCreateCategory,
  localListCategories,
  localSaveCategoryTree,
} from "./localDemo";

export async function GET(request: NextRequest) {
  const isRemote = await isRemoteRequest(request);

  if (!isRemote) {
    try {
      const isInternal = await isInternalUser(request);
      return NextResponse.json(
        localListCategories({
          isInternal,
          searchParams: request.nextUrl.searchParams,
        }),
      );
    } catch (error) {
      return toApiErrorResponse(error, {
        fallbackMessage: tServiceDeskApi("api.categories.fetchList"),
      });
    }
  }

  return proxyJson(request, {
    path: "/service-desk/categories",
    query: request.nextUrl.searchParams,
    errorMessage: tServiceDeskApi("api.categories.fetchList"),
    mapData: mapCategoryListPayload,
  });
}

export async function POST(request: NextRequest) {
  const isRemote = await isRemoteRequest(request);
  const parsedBody = createCategorySchema.safeParse(
    (await request.json()) as CreateCategoryInput,
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
        localCreateCategory({
          isInternal,
          input: body,
        }),
        { status: 201 },
      );
    } catch (error) {
      return toApiErrorResponse(error, {
        fallbackMessage: tServiceDeskApi("api.categories.create"),
      });
    }
  }

  return proxyJson(request, {
    method: "POST",
    path: "/service-desk/categories",
    body: toCategoryWritePayload(body),
    errorMessage: tServiceDeskApi("api.categories.create"),
    mapData: mapCategoryItemPayload,
  });
}

export async function PUT(request: NextRequest) {
  const isRemote = await isRemoteRequest(request);
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

  if (!isRemote) {
    try {
      const isInternal = await isInternalUser(request);
      return NextResponse.json(
        localSaveCategoryTree({
          isInternal,
          payload: body,
        }),
      );
    } catch (error) {
      return toApiErrorResponse(error, {
        fallbackMessage: tServiceDeskApi("api.categories.save"),
      });
    }
  }

  return proxyJson(request, {
    method: "PUT",
    path: "/service-desk/categories",
    body,
    errorMessage: tServiceDeskApi("api.categories.save"),
    mapData: mapCategoryTreePayload,
  });
}
