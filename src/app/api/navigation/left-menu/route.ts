// src/app/api/navigation/left-menu/route.ts
import { NextRequest, NextResponse } from "next/server";

import { getCurrentUserName, isRemoteRequest } from "@/app/api/_helpers";
import { portalApiJson } from "@/app/api/_helpers/portalApiJson";
import { resolveDemoAuth } from "@/mocks/domain/user";
import { leftMenuJsonMock } from "@/mocks/ui/navigation/leftMenu";

export async function GET(req: NextRequest) {
  const currentUserName = await getCurrentUserName(req);

  if (!currentUserName) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const isRemote = await isRemoteRequest(req);

  if (!isRemote) {
    const demoAuth = resolveDemoAuth(currentUserName);

    if (!demoAuth) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    const leftMenu = leftMenuJsonMock.filter(
      (item) => item.minAccessLevel <= demoAuth.permission,
    );

    return NextResponse.json({ data: leftMenu });
  }

  return portalApiJson(req, {
    method: "GET",
    path: `/navigation/left-menu/${encodeURIComponent(currentUserName)}`,
    errorMessage: "Failed to fetch left menu items",
  });
}
