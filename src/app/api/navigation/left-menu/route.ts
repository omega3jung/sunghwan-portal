// src/app/api/navigation/left-menu/route.ts
import { NextRequest, NextResponse } from "next/server";

import { getUserAccessLevel, isRemoteRequest } from "@/app/api/_helpers";
import { portalApiJson } from "@/app/api/_helpers/portalApiJson";
import { leftMenuJsonMock } from "@/mocks/ui/navigation/leftMenu";

export async function GET(req: NextRequest) {
  const userAccessLevel = await getUserAccessLevel(req);

  if (!userAccessLevel) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const isRemote = await isRemoteRequest(req);

  if (!isRemote) {
    return NextResponse.json({ data: leftMenuJsonMock });
  }

  return portalApiJson(req, {
    method: "GET",
    path: `/navigation/left-menu/${userAccessLevel}`,
    errorMessage: "Failed to fetch left menu items",
  });
}
